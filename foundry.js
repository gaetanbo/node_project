const foundryRoute = require('express').Router();
const utils = require("./utils"); 

const _quality = [1, 2, 3, 4, 5];
const _cities = ["Caerleon","Thetford","Fort Sterling","Lymhurst","Bridgewatch","Martlock"];
const _tiers = [3,4,5,6,7,8];

const enchantPrices = { 
    '@1' : {
        name : "RUNE",
        prices : []
    }, 
    '@2' : {
        name : "SOUL",
        prices : []
    },  
    "@3" : {
        name : "RELIC",
        prices : []
    }, 
};
    
const ratio = [
    {
        types : ["MAIN"],//one-handed weapons
        value : 72
    },
    {
        types : ["2H"],//two-handed weapons
        value : 96
    },
    {
        types : ["ARMOR","BAG"],// chests and bags
        value : 48
    },
    {
        types : ["SHOES","HEAD","OFF","CAPE"],// shoes, heads, offhand, and capes
        value : 24
    }
];

function pickWillEnchant(name){
    let enchant = { current : "", after : "@1", after_name : name + "@1" };
    if (name.includes("@1")) {
        enchant = { current : "@1", after : "@2", after_name : name.substring(0,name.length-2) + "@2" };
    } else if (name.includes("@2")) {
        enchant = { current : "@2", after : "@3", after_name : name.substring(0,name.length-2) + "@3" };
    } else if (name.includes("@3")) {
        enchant = { current : "@3", after : "", after_name : "" };
    }
    return enchant;
}

function pickRatio(name){
    return ratio.find(x => x.types.some(y => name.includes(y))).value;
}

function loadEnchantPrices(){
    return new Promise(async (resolve, reject) => {
        for(let enchantItem in enchantPrices){
            for(let i=3; i<9; i++){
                price = await utils.getPrice(`T${i}_${enchantPrices[enchantItem].name}`, "Caerleon");
                let obj = JSON.parse(price)[0];
                if(obj){
                    enchantPrices[enchantItem].prices[i] = obj.sell_price_min;
                }else{
                    enchantPrices[enchantItem].prices[i] = -1;
                }
            }
        }
        resolve();
    })
}

foundryRoute.post('/foundry', function (req, res) {
    const city = req.body.city;
    const category = req.body.category;
    const tiers = req.body.tiers.length > 1 ? req.body.tiers.reduce((a,c) => (a?a+",":a) + c) : req.body.tiers;
    return res.redirect(`/foundry?category=${category}&city=${city}&tiers=${tiers}`);
});

foundryRoute.get('/foundry', (req, res) => {
    let city = "Caerleon";
    if(req.query.city && _cities.some( x => x.toLowerCase() === req.query.city.toLowerCase())){ // Check if the city used exists
        city = req.query.city;
    }
    let fileList = utils.getJsonList();
    if(fileList.some(x => x.replace('.json','') === req.query.category)){ // Check if the category used exists
        try{
            loadEnchantPrices().then( async _ => {
                let listItems = [];
                let usefullItem = utils.getObjectList(req.query.category + ".json");
                if(req.query.tiers){ // Check if tiers list paramater is exists
                    usefullItem = usefullItem.filter(item => req.query.tiers.split(',').includes(item.UniqueName.substring(1,2))); // Trim the item array to remove unused tiers
                }
                for(let item of usefullItem){
                    let willEnchant = pickWillEnchant(item.UniqueName);
                    let ratio = pickRatio(item.UniqueName);
                    if(willEnchant.after !== ""){
                        try{
                            // Get price of ressources needed to upgrade
                            let itemEnchantPrice = enchantPrices[willEnchant.after].prices[item.UniqueName.substring(1,2)];

                            let hrstart = process.hrtime()

                            // Get price TN
                            let itemInfo = await utils.getPrice(item.UniqueName, city, _quality.reduce((a,c) => (a?a+",":a) + c) )
                            itemInfo = JSON.parse(itemInfo);
                            // Get price TN+1
                            let itemNextInfo = await utils.getPrice(willEnchant.after_name, city, _quality.reduce((a,c) => (a?a+",":a) + c) )
                            itemNextInfo = JSON.parse(itemNextInfo);

                            let hrend = process.hrtime(hrstart);
                            console.log('%s ET: %ds %dms',item.UniqueName, hrend[0], hrend[1] / 1000000);

                            // Check for every quality
                            for(let quality of _quality){
                                let qualitytItemInfo = itemInfo.find( x => x.quality == quality); // Get the correct item by quality inside the array for TN
                                let qualitytItemNextInfo = itemNextInfo.find( x => x.quality == quality); // Get the correct item by quality inside the array for TN+1
                                if(qualitytItemInfo && qualitytItemNextInfo){ // If quality is found, proceed
                                    let itemPrice = qualitytItemInfo.sell_price_min
                                    let itemNextPrice = qualitytItemNextInfo.sell_price_min
                                    let benef = itemNextPrice - (itemPrice + ( ratio * itemEnchantPrice ))
                                    if(itemPrice > 0 && itemNextPrice > 0 && benef > 0){
                                        listItems.push({
                                            item : item.LocalizedNames.find(x => x.Key == "FR-FR").Value,
                                            name : item.UniqueName,
                                            next_name : willEnchant.after_name,
                                            price : utils.numberWithCommas(itemPrice),
                                            price_next : utils.numberWithCommas(itemNextPrice),
                                            src : "https://gameinfo.albiononline.com/api/gameinfo/items/" + item.UniqueName + "?quality=" + quality,
                                            src_next : "https://gameinfo.albiononline.com/api/gameinfo/items/" + willEnchant.after_name + "?quality=" + quality,
                                            ratio,
                                            price_enchant : itemEnchantPrice,
                                            src_enchant : "https://gameinfo.albiononline.com/api/gameinfo/items/" + item.UniqueName.substring(0,3) + enchantPrices[willEnchant.after].name,
                                            benef,
                                            complete_price_enchant : utils.numberWithCommas(ratio * itemEnchantPrice)
                                        })
                                    }
                                }
                            }
                        }catch(e){
                            // if it crashed it just skips the item
                        }
                    }
                };
                listItems.sort((a,b)=> b.benef - a.benef);
                listItems = listItems.map(x => {x.benef = utils.numberWithCommas(x.benef); return x});
                res.render('foundry', {fileList, cities : _cities, tiers : _tiers, listItems, selected : {
                    city,
                    category : req.query.category,
                    tiers : req.query.tiers.split(',')
                }});
            }).catch(e => {
                res.render('index');
            })
        }catch(e){
            res.render('index');
        }
    }else{
        res.render('foundry', {fileList, cities : _cities, tiers : _tiers, listItems : [], selected : {}});
    }
})

module.exports = foundryRoute;