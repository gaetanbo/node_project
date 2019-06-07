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
    let enchant = "@1";
    if (name.includes("@1")) {
        enchant = "@2";
    } else if (name.includes("@2")) {
        enchant = "@3";
    } else if (name.includes("@3")) {
        enchant = "";
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
            loadEnchantPrices().then( _ => {
                let usefullItem = utils.getObjectList(req.query.category + ".json");
                for(let item of usefullItem){
                    let willEnchant = pickWillEnchant(item.UniqueName);
                    let ratio = pickRatio(item.UniqueName);
                    let itemEnchantPrice = enchantPrices[willEnchant].prices[item.UniqueName.substring(1,2)];
                    let itemPrice = utils.getPrice(item.UniqueName, "Caerleon")
                };
                res.render('foundry');
            })
        }catch(e){
            res.render('index');
        }
    }else{
        res.render('index');
    }
})

module.exports = foundryRoute;