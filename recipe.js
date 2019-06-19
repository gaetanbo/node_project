const recipeRoute = require('express').Router();
const utils = require('./utils');

const _cities = ["Caerleon","Thetford","Fort Sterling","Lymhurst","Bridgewatch","Martlock"];

recipeRoute.get('/recipe/query', (req,res) => {
    let item = req.query.item;
    let filelist = utils.getJsonList(item);
     if (filelist.some(x => x.replace('.json','') === req.query.category)) {  // Check if the category used exists
         //let usefullItem = utils.getObjectList(item);
         console.log(usefullItem);
     }
   try{
       return res.status(200).json(listRecipe);
   } catch (e) {
       console.log(e);
       return res.status(500).json({message:"Error with query"});
   }
});


recipeRoute.get('/recipe/get-category', (req,res) => {
    console.log('cat2 : '+req.query.category    )
    console.log(utils.getObjectList(req.query.category+"/"));
    if (req.query.category){

        return res.status(200).json(utils.getJsonList(req.query.category+"/"));

    } else{
        return res.status(200).json([]);
    }
})

recipeRoute.get('/recipe', (req,res) => {
    res.render('recipe',{categories:utils.getItemJsonList(),cities : _cities,items:null })
})

module.exports = recipeRoute;
