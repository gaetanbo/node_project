const marathonienRoute = require('express').Router();
const consts = require("./consts");
const utils = require("./utils"); 

const _quality = [1, 2, 3, 4, 5];
const _cities = ["Caerleon","Thetford","Fort Sterling","Lymhurst","Bridgewatch","Martlock"];
const _tiers = [3,4,5,6,7,8];
const _types = consts.types;


//SAFE WARP NO BZ
const _warp = { "Caerleon" : 
    {
        "Caerleon" : 0,
        "Thetford" : 4,
        "Fort Sterling" : 3,
        "Lymhurst" : 4,
        "Bridgewatch" : 4,
        "Martlock" : 4
    },
    "Thetford" : {
        "Caerleon" : 4,
        "Thetford" : 0,
        "Fort Sterling" : 5,
        "Lymhurst" : 8,
        "Bridgewatch" : 10,
        "Martlock"  : 5,
    },
    "Fort Sterling" : {
        "Caerleon" : 3,
        "Thetford" : 5,
        "Fort Sterling" : 0,
        "Lymhurst" : 5,
        "Bridgewatch" : 7,
        "Martlock"  : 7,
    },
    "Lymhurst" :{
        "Caerleon" : 4,
        "Thetford"  : 8,
        "Fort Sterling" : 5,
        "Lymhurst" : 0,
        "Bridgewatch" : 4,
        "Martlock"  : 8,
    },
    "Bridgewatch" : {
        "Caerleon" : 4,
        "Thetford" : 10,
        "Fort Sterling" : 7,
        "Lymhurst" : 4,
        "Bridgewatch" : 0,
        "Martlock"  : 5,
    },
    "Martlock" : {
        "Caerleon" : 4,
        "Thetford" : 5,
        "Fort Sterling" : 7,
        "Lymhurst" : 8,
        "Bridgewatch" : 5,
        "Martlock"  : 0,
    }
}

const _ressources_weight = {
    "T1" : .2,
    "T2" : .2,
    "T3" : .3,
    "T4" : .5,
    "T5" : .8,
    "T6" : 1.1,
    "T7" : 1.7,
    "T8" : 2.6,
}

const _equipments_weight = {
    "ARMOR" : {
        "T1" : 1,
        "T2" : 1,
        "T3" : 2,
        "T4" : 3,
        "T5" : 5,
        "T6" : 7,
        "T7" : 11,
        "T8" : 17    
    },
    "HEAD" : {
        "T1" : 0,
        "T2" : 0,
        "T3" : 2,
        "T4" : 3,
        "T5" : 5,
        "T6" : 7,
        "T7" : 11,
        "T8" : 17    
    },
    "SHOES" : {
        "T1" : 0,
        "T2" : 0,
        "T3" : 1,
        "T4" : 1,
        "T5" : 2,
        "T6" : 3,
        "T7" : 5,
        "T8" : 8   
    }
}

const _accessories_weight = {
    "BAG" : {
        "T1" : 1,
        "T2" : 1,
        "T3" : 2,
        "T4" : 3,
        "T5" : 5,
        "T6" : 7,
        "T7" : 11,
        "T8" : 17    
    },
    "CAPE" : {
        "T1" : 0,
        "T2" : 0,
        "T3" : 1,
        "T4" : 1,
        "T5" : 2,
        "T6" : 3,
        "T7" : 5,
        "T8" : 8   
    },
}

marathonienRoute.get('/marathonien/query', (req, res) => {
    let from_city = "Caerleon";
    if(req.query.from_city && _cities.some( x => x.toLowerCase() === req.query.from_city.toLowerCase())){ // Check if the city used exists
        from_city = req.query.from_city;
    }

    let to_city = "Any";
    if(req.query.to_city && _cities.some( x => x.toLowerCase() === req.query.to_city.toLowerCase())){ // Check if the city used exists
        to_city = req.query.to_city;
    }

    let cityQuery = from_city +"," + to_city; // Query used to retrieve info about prices whith API
    if(to_city === "Any"){
        cityQuery = _cities.reduce((a,c) => (a?a+",":a) + c);
    }

    if( req.query.type && _types.includes(req.query.type) && req.query.category ){ // Check if the category used exists
        try{
            listItems = [];
            let usefullItem = utils.getObjectList(req.query.category, req.query.type);
            if(req.query.tiers){ // Check if tiers list paramater is exists
                usefullItem = usefullItem.filter(item => req.query.tiers.includes(item.UniqueName.substring(1,2))); // Trim the item array to remove unused tiers
            }
            Promise.all(
                    usefullItem.map(item => Promise.all([
                        utils.getPrice(item.UniqueName, cityQuery, _quality.reduce((a,c) => (a?a+",":a) + c)),
                        utils.getData(item.UniqueName)
                    ]))
                ).then( data => {
                let warp = _warp[from_city][to_city];
                for(let i=0;i<data.length;i++){ // Rely on an index to get info of item and it's associated price
                    let item = usefullItem[i]; 
                    let itemInfo = data[i][0]
                    let itemData = data[i][1];
                    // Check for every quality
                    for(let quality of _quality){
                        let qualitytItemsInfos = itemInfo.filter( x => x.quality == quality); // Get the correct items by quality inside the array for TN
                        let from_itemInfos = qualitytItemsInfos.find( x => x.city == from_city);
                        let to_itemInfos = qualitytItemsInfos.find( x => x.city == to_city);
                        if(from_itemInfos && to_itemInfos){ // If quality is found, proceed
                            let from_itemPrice = from_itemInfos.sell_price_min;
                            let to_itemPrice = to_itemInfos.sell_price_min
                            let benef = to_itemPrice - from_itemPrice;
                            let weight = itemData.weight;
                            switch(req.query.type){
                                case "ressources" : 
                                    weight = _ressources_weight[item.UniqueName.substring(0,2)]; 
                                    break;
                                case "accessories" : 
                                    if(item.UniqueName.includes("BAG")){
                                        weight = _accessories_weight["BAG"][item.UniqueName.substring(0,2)]; 
                                    }else{
                                        weight = _accessories_weight["CAPE"][item.UniqueName.substring(0,2)]; 
                                    }
                                    break;
                                case "equipments" : 
                                        weight = _equipments_weight[item.UniqueName.split('_')[1]][item.UniqueName.substring(0,2)]; 
                                    break;
                            }
                            weight = (weight * ( req.query.bonus ? 0.7 : 1 )).toFixed(2); // Take into account the bonus of gathering gear weight reduction
                            let ratio = Math.floor(((to_itemPrice - from_itemPrice) / warp) / weight );
                            if(from_itemPrice > 0 && to_itemPrice > 0 && benef > 0){
                                listItems.push({
                                    item : item.LocalizedNames.length ? item.LocalizedNames.find(x => x.Key == "FR-FR").Value : item.LocalizedNames["FR-FR"],
                                    name : item.UniqueName,
                                    weight : weight,
                                    from_price : utils.numberWithCommas(from_itemPrice),
                                    to_price : utils.numberWithCommas(to_itemPrice),
                                    src : "https://gameinfo.albiononline.com/api/gameinfo/items/" + item.UniqueName + "?quality=" + quality,
                                    ratio,
                                    benef,
                                })
                            }
                        }
                    }
                }
                listItems.sort((a,b)=> b.ratio - a.ratio);
                listItems = listItems.map(x => {x.benef = utils.numberWithCommas(x.benef); return x});
                return res.status(200).json(listItems);              
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

marathonienRoute.get('/marathonien/get-category', (req, res) => {
    if(req.query.category && consts.types.includes(req.query.category)){
        return res.status(200).json(consts.categories[req.query.category]);
    }else{
        return res.status(200).json([]); 
    }
})

marathonienRoute.get('/marathonien', (req, res) => {
    res.render('marathonien', {types : _types, cities : _cities, tiers : _tiers});
})

module.exports = marathonienRoute;