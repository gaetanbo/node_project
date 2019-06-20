const recipeRoute = require('express').Router();
const consts = require("./consts");
const utils = require('./utils');
const _types = consts.types;

const _cities = ["Caerleon","Thetford","Fort Sterling","Lymhurst","Bridgewatch","Martlock"];

recipeRoute.get('/recipe/query', (req,res) => {
    // Récuperer la liste des composants de l'item + la quantité pour chaque compo
            // Faire prix_du_comp x quantité = prix_inter_comp
            // Faire somme des prix intermédiaires pour obtenir le prix du craft
                // Ajouter le prix de lutilisation du batiment ???
            // Aller chercher le prix de litem a lah pour comparaison
    // Afficher la liste des composants avec le prix_unitaire de chaque compo et le prix_inter_comp + limage du composant
    // Afficher limage de litem, son prix à lah et la somme de tous les prix_inter_comp
    // Enjoy

    console.log('Asked : ' + req.query.item);
    let itemRecipe = [];
     var recipePromise = utils.getData(req.query.item);
     try{
       recipePromise.then( data => {
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
             data.enchantments.enchantments[2].craftingRequirements.craftResourceList.forEach( x => {
                 itemRecipe.push({
                     name: x.uniqueName,
                     count: x.count,
                     src : "https://gameinfo.albiononline.com/api/gameinfo/items/"+x.uniqueName
                 })
             })
         } else {
             data.craftingRequirements.craftResourceList.forEach( x => {
                 utils.getPrice(x.uniqueName,"Caerleon").then( data => {
                     itemRecipe.push({
                         name : x.uniqueName,
                         count: x.count,
                         prix : data[0].sell_price_min,
                         src : "https://gameinfo.albiononline.com/api/gameinfo/items/"+x.uniqueName
                     })
                     // console.log(itemRecipe);
                     return res.status(200).json(itemRecipe)
                 }).catch(e => {
                     console.log(e)
                     return res.status(500).json(e.message)
                 })
             })
         }
       })

     }catch(e){
        return res.status(500).json(e.message)
     };



    // try {
    //     recipePromise.then( data => {
    //                 if (data.craftingRequirements.craftResourceList !== null) {
    //                     data.craftingRequirements.craftResourceList.forEach( x => {
    //                         // Call chaque prix et ajouter la ligne prix dans itemRecipe
    //                             itemRecipe.push(
    //                                 {
    //                                     name: x.uniqueName,
    //                                     count: x.count,
    //                                     prix : 10,
    //                                     prix_inter : (x.count * 10 ),
    //                                     src : "https://gameinfo.albiononline.com/api/gameinfo/items/" + x.uniqueName
    //                                 })
    //                         }
    //                     )
    //                     console.log(itemRecipe);
    //                     return res.status(200).json(itemRecipe)
    //                 }
    //             // }
    //      }
    //     ).catch(e =>{
    //         return res.status(500).json(e.message)
    //     } );
    // } catch (e) {
    //     return res.status(500).json(e.message)
    // }
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
