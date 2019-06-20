const recipeRoute = require('express').Router();
const consts = require("./consts");
const utils = require('./utils');
const _types = consts.types;

const _cities = ["Caerleon","Thetford","Fort Sterling","Lymhurst","Bridgewatch","Martlock"];

recipeRoute.get('/recipe/query', (req,res) => {
    let itemRecipe = [];
    var pricePromise = utils.getPrice(req.query.item,"Caerleon",1);
    var recipePromise = utils.getData(req.query.item);
    let itemprice = 0;
    try{
        pricePromise.then(prixx => {
            itemprice = prixx[0].sell_price_min
        }).catch(e => {
            console.log(e)
        });
        recipePromise.then( data => {
            // Traitement particulier pour les items enchants
            if (req.query.item.includes("@1")) {
                data.enchantments.enchantments[0].craftingRequirements.craftResourceList.forEach( x => {
                    itemRecipe.push({
                        name: x.uniqueName,
                        count: x.count,
                        src : "https://gameinfo.albiononline.com/api/gameinfo/items/"+x.uniqueName
                    })
                })
            } else if (req.query.item.includes("@2")) {
                data.enchantments.enchantments[1].craftingRequirements.craftResourceList.forEach( x => {
                    itemRecipe.push({
                        name: x.uniqueName,
                        count: x.count,
                        src : "https://gameinfo.albiononline.com/api/gameinfo/items/"+x.uniqueName
                    })
                })
            } else if (req.query.item.includes("@3")) {
                //console.log(data.enchantments.enchantments[2])
                //console.log(data.enchantments.enchantments[2].craftingRequirements.craftResourceList)
                let Promises = data.enchantments.enchantments[2].craftingRequirements.craftResourceList.map( x => utils.getPrice(x.uniqueName,"Caerleon"))
                            // fonctionne pas pour les ressouces car il manque le @3 dans luniqueName
                            // mais sinon devrait fonctionner +/-
                // Promise.all(Promises).then(data2 => {
                //     let total = 0;
                //     for (let i=0;i<data.enchantments.enchantments[2].craftingRequirements.craftResourceList.length;i++){
                //         total += data.enchantments.enchantments[2].craftingRequirements.craftResourceList[i].count * data2[i][0].sell_price_min
                //         itemRecipe.push({
                //             name:data.enchantments.enchantments[2].craftingRequirements.craftResourceList[i].uniqueName,
                //             count: data.enchantments.enchantments[2].craftingRequirements.craftResourceList[i].count,
                //             prix: utils.numberWithCommas(data2[i][0].sell_price_min),
                //             subtot: utils.numberWithCommas(data.enchantments.enchantments[2].craftingRequirements.craftResourceListt[i].count * data2[i][0].sell_price_min),
                //             src:"https://gameinfo.albiononline.com/api/gameinfo/items/" + data.enchantments.enchantments[2].craftingRequirements.craftResourceList[i].uniqueName
                //         })
                //     }
                //     itemRecipe.push({total:utils.numberWithCommas(total)})
                //     //  console.log(itemRecipe)
                //     return res.status(200).json(itemRecipe)
                // }).catch(e => {
                //     return res.status(500).json(e.message);
                // })
            } else {
                // traitement pour les items flat
                let Promises = data.craftingRequirements.craftResourceList.map( x => utils.getPrice(x.uniqueName,"Caerleon"))
                Promise.all(Promises).then(data2 => {
                    let total = 0;
                    for (let i=0;i<data.craftingRequirements.craftResourceList.length;i++){
                        total += data.craftingRequirements.craftResourceList[i].count * data2[i][0].sell_price_min
                        itemRecipe.push({
                            name: data.craftingRequirements.craftResourceList[i].uniqueName,
                            count: data.craftingRequirements.craftResourceList[i].count,
                            prix: utils.numberWithCommas(data2[i][0].sell_price_min),
                            subtot: utils.numberWithCommas(data.craftingRequirements.craftResourceList[i].count * data2[i][0].sell_price_min),
                            src:"https://gameinfo.albiononline.com/api/gameinfo/items/"+data.craftingRequirements.craftResourceList[i].uniqueName
                        })
                    }
                    itemRecipe.push({total:utils.numberWithCommas(total),itemprice:utils.numberWithCommas(itemprice)})
                    //console.log('price :'+itemprice)
                    // console.log(itemRecipe)
                    return res.status(200).json(itemRecipe)
                }).catch(e => {
                    return res.status(500).json(e.message);
                })
            }
        }).catch(e => {
            return res.status(500).json(e.message);
        })
    }catch(e){
        return res.status(500).json(e.message)
    };
});


recipeRoute.get('/recipe/get-category', (req,res) => {
    if (req.query.category){
        return res.status(200).json(utils.getObjectList(req.query.category));
    } else{
        return res.status(200).json([]);
    }
})

recipeRoute.get('/recipe/get-type', (req,res) => {
    if (req.query.types){
        return res.status(200).json(consts.categories[req.query.types]);
    } else{
        return res.status(200).json([]);
    }
})

recipeRoute.get('/recipe', (req,res) => {

    res.render('recipe',{types:_types,cities : _cities,items:null,categories:null })
})

module.exports = recipeRoute;
