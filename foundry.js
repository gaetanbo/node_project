const foundryRoute = require('express').Router();
const utils = require("./utils"); 

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
                    enchantPrices[enchantItem].prices[i] = (obj.buy_price_max + obj.buy_price_min)/2;
                }else{
                    enchantPrices[enchantItem].prices[i] = -1;
                }
            }
        }
        resolve();
    })
}

foundryRoute.get('/foundry', (req, res) => {
    if(req.query.category){
        try{
            loadEnchantPrices().then( async _ => {
                let listItems = [];
                let usefullItem = utils.getObjectList(req.query.category + ".json");
                for(let item of usefullItem){
                    let willEnchant = pickWillEnchant(item.UniqueName);
                    let ratio = pickRatio(item.UniqueName);
                    if(willEnchant.after !== ""){
                        try{
                            let itemEnchantPrice = enchantPrices[willEnchant.after].prices[item.UniqueName.substring(1,2)];
                            let itemPrice = await utils.getPrice(item.UniqueName, "Caerleon")
                            itemPrice = JSON.parse(itemPrice)[0];
                            itemPrice = (itemPrice.buy_price_max + itemPrice.buy_price_min)/2
                            if(itemPrice > 0){
                                let itemNextPrice = await utils.getPrice(willEnchant.after_name, "Caerleon")
                                itemNextPrice = JSON.parse(itemNextPrice)[0];
                                itemNextPrice = (itemNextPrice.sell_price_max + itemNextPrice.sell_price_min)/2
                                //benef : itemNextPrice - (itemPrice + ( ratio * itemEnchantPrice )) WILL BE CALCULATED ON FRONT
                                listItems.push({
                                    name : item.UniqueName,
                                    next_name : willEnchant.after_name,
                                    price : itemPrice,
                                    price_next : itemNextPrice,
                                    src : "https://gameinfo.albiononline.com/api/gameinfo/items/" + item.UniqueName,
                                    src_next : "https://gameinfo.albiononline.com/api/gameinfo/items/" + willEnchant.after_name,
                                    ratio,
                                    price_enchant : itemEnchantPrice
                                })
                            }
                        }catch(e){
                            // if it crashed it just skips the item
                        }
                    }
                };
                res.render('foundry', {listItems});
            }).catch(e => {
                res.render('index');
            })
        }catch(e){
            res.render('index');
        }
    }else{
        res.render('index');
    }
})

module.exports = foundryRoute;