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
    return new Promise((resolve, reject) => {
        let pricesPromise = [];
        for(let enchantItem in enchantPrices){
            for(let i=4; i<9; i++){
                pricesPromise.push(utils.getPrice(`T${i}_${enchantPrices[enchantItem].name}`, "Caerleon"));
            }
        }
        Promise.all(pricesPromise).then(data => {
            data = data.map(d => JSON.parse(d)[0]);
            for(let enchantItem in enchantPrices){
                for(let i=4; i<9; i++){
                    // Calculus to place right price on correct object
                    let obj = data[( enchantItem[1] - 1 ) * 4 + ( i - 4 )]
                    if(obj){
                        enchantPrices[enchantItem].prices[i] = obj.sell_price_min;
                    }else{
                        enchantPrices[enchantItem].prices[i] = -1;
                    }
                }
            }
            resolve();
        }).catch(e => {
            reject(e);
        })
    })
}

foundryRoute.get('/foundry/query', (req, res) => {
    let city = "Caerleon";
    if(req.query.city && _cities.some( x => x.toLowerCase() === req.query.city.toLowerCase())){ // Check if the city used exists
        city = req.query.city;
    }
    let fileList = utils.getJsonList();
    if(fileList.some(x => x.replace('.json','') === req.query.category)){ // Check if the category used exists
        try{
            loadEnchantPrices().then( _ => {
                let listItems = [];
                let usefullItem = utils.getObjectList(req.query.category + ".json");
                if(req.query.tiers){ // Check if tiers list paramater is exists
                    usefullItem = usefullItem.filter(item => req.query.tiers.includes(item.UniqueName.substring(1,2))); // Trim the item array to remove unused tiers
                }
                Promise.all(usefullItem.map(item => utils.getPrice(item.UniqueName, city, _quality.reduce((a,c) => (a?a+",":a) + c) ))).then( data => {
                    data = data.map(d => JSON.parse(d));
                    for(let i=0;i<data.length;i++){ // Rely on an index to get info of item and it's associated price
                        let item = usefullItem[i]; 
                        let willEnchant = pickWillEnchant(item.UniqueName);
                        let ratio = pickRatio(item.UniqueName);
                        if(willEnchant.after !== ""){
                            try{
                                let itemEnchantPrice = enchantPrices[willEnchant.after].prices[item.UniqueName.substring(1,2)]; // Get price of ressources needed to upgrade
                                let itemInfo = data.find(x => x[0].item_id === item.UniqueName);
                                let itemNextInfo = data.find(x => x[0].item_id === willEnchant.after_name);
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
                    }
                    listItems.sort((a,b)=> b.benef - a.benef);
                    listItems = listItems.map(x => {x.benef = utils.numberWithCommas(x.benef); return x});
                    return res.status(200).json(listItems);
                }).catch(e => {
                    return res.status(500).json(e.message);
                })                
            }).catch(e => {
                return res.status(500).json(e.message);
            })
        }catch(e){
            return res.status(500).json(e.message);
        }
    }else{
        return res.status(500).json("Error with query");
    }
    
})

foundryRoute.get('/foundry', (req, res) => {
    res.render('foundry', {categories : utils.getJsonList(), cities : _cities, tiers : _tiers});
})

module.exports = foundryRoute;