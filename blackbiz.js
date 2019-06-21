const blackBizRoute = require('express').Router();
const consts = require("./consts");
const utils = require("./utils"); 

const _quality_name = ["Normal","Acceptable","Admirable","Formidable","Exceptionnel"]
const _quality = [1, 2, 3, 4, 5];
const _tiers = [3,4,5,6,7,8];


blackBizRoute.get('/blackbiz/query', (req, res) => {
    if(req.query.type && consts.types.includes(req.query.type) && consts.categories[req.query.type].includes(req.query.category)){ // Check if the category used exists
        try{
            let listItems = [];
            let usefullItem = utils.getObjectList(req.query.category, req.query.type);
            if(req.query.tiers){ // Check if tiers list paramater is exists
                usefullItem = usefullItem.filter(item => req.query.tiers.includes(item.UniqueName.substring(1,2))); // Trim the item array to remove unused tiers
            }
            Promise.all(usefullItem.map(item => utils.getPrice(item.UniqueName, "Caerleon,Black Market", _quality.reduce((a,c) => (a?a+",":a) + c) ))).then( data => {
                for(let i=0;i<data.length;i++){ // Rely on an index to get info of item and it's associated price
                    let item = usefullItem[i]; 
                    let itemInfo = data[i];
                    // Check for every quality
                    for(let quality of _quality){
                        let qualitytItemsInfos = itemInfo.filter( x => x.quality == quality); // Get the correct items by quality inside the array for TN
                        let BM_itemInfos = qualitytItemsInfos.find( x => x.city == "Black Market");
                        let CA_itemInfos = qualitytItemsInfos.find( x => x.city == "Caerleon");
                        if(BM_itemInfos && CA_itemInfos){ // If quality is found, proceed
                            let BM_itemPrice = BM_itemInfos.sell_price_min;
                            let CA_itemPrice = CA_itemInfos.sell_price_min;
                            let benef = Math.round(BM_itemPrice * .98) - CA_itemPrice;
                            if(BM_itemPrice > 0 && CA_itemPrice > 0 && benef > 0){
                                listItems.push({
                                    item : item.LocalizedNames.find(x => x.Key == "FR-FR").Value,
                                    tier : item.UniqueName.substring(0,2),
                                    quality : _quality_name[quality-1],
                                    name : item.UniqueName,
                                    enchant : item.UniqueName.indexOf("@") !== -1 ? '.' + item.UniqueName[item.UniqueName.indexOf("@")+1] : ".0",
                                    BM_price : utils.numberWithCommas(BM_itemPrice),
                                    CA_price : utils.numberWithCommas(CA_itemPrice),
                                    src : "https://gameinfo.albiononline.com/api/gameinfo/items/" + item.UniqueName + "?quality=" + quality,
                                    benef
                                })
                            }
                        }
                    } 
                }
                listItems.sort((a,b)=> b.benef - a.benef);
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

blackBizRoute.get('/blackbiz/get-category', (req, res) => {
    if(req.query.category && consts.types.includes(req.query.category)){
        return res.status(200).json(consts.categories[req.query.category]);
    }else{
        return res.status(200).json([]); 
    }
})

blackBizRoute.get('/blackbiz', (req, res) => {
    res.render('blackbiz', {
        types : consts.types.filter(x => ["artifacts","ressources","consumable"].every( c => x !== c)),
        tiers : _tiers
    });
})

module.exports = blackBizRoute;