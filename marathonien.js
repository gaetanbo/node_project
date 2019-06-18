const marathonienRoute = require('express').Router();
const utils = require("./utils"); 

const _quality = [1, 2, 3, 4, 5];
const _cities = ["Caerleon","Thetford","Fort Sterling","Lymhurst","Bridgewatch","Martlock"];
const _tiers = [3,4,5,6,7,8];

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

    let fileList = utils.getJsonList();
    if(fileList.some(x => x.replace('.json','') === req.query.category)){ // Check if the category used exists
        try{
            listItems = [];
            let usefullItem = utils.getItemList(req.query.category);
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
                            let ratio = Math.floor(((to_itemPrice - from_itemPrice) / warp) / itemData.weight);
                            if(from_itemPrice > 0 && to_itemPrice > 0 && benef > 0){
                                listItems.push({
                                    item : item.LocalizedNames.find(x => x.Key == "FR-FR").Value,
                                    name : item.UniqueName,
                                    weight : itemData.weight,
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

marathonienRoute.get('/marathonien', (req, res) => {
    res.render('marathonien', {categories : utils.getJsonList(), cities : _cities, tiers : _tiers});
})

module.exports = marathonienRoute;