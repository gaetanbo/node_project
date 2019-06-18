const bodyParser = require('body-parser');
const express = require('express');
const request = require('request');
const moment = require('moment');
const app = express();
const fs = require('fs');
const logger = require('./logger');

// Add my services / function I need from other files
const utils = require("./utils");

// Add my routes from declared from other files
const foundryRoute = require("./foundry");
const marathonienRoute = require("./marathonien");

moment.locale('fr');
app.use(express.static('public'));
app.use(bodyParser.urlencoded({extended: true}));
app.use(logger);
app.set('view engine', 'ejs');

// Initialize the list of JSON file on server
let jsonList = utils.getJsonList();
// Initialize var for .get/bbiz :
let categoryAsked = "";

app.use("/", foundryRoute);
app.use("/", marathonienRoute);

app.get('/', function (req, res) {
    res.render('index');
});

app.get('/guild', function (req, res) {
    res.render('guild');
});

app.get('/player', function (req, res) {
    res.render('player');
});

app.post('/player', function (req, res) {
    var player = "";
    player = req.body.player_asked;
    console.log(player)
    res.render('player');
      //    $.get("https://gameinfo.albiononline.com/api/gameinfo/search?q="+player,function(data)  {
      //				if (data.players === undefined || data.players.length == 0) {
      //					alert('No player Found');
      //				} else if(data.players.length == 1) {
      //				 	var playerId = data.players[0].Id;
      //					console.log(data.players);
      //				 	$("#player_results").append("<p><strong>"+data.players[0].Name+"</strong></p>");
      //					$.get("https://gameinfo.albiononline.com/api/gameinfo/players/"+playerId,function(playerdata)  {
      //						console.log(playerdata);
      //						var craftot = addCommas(playerdata.LifetimeStatistics.Crafting.Total);
      //						var gathertot = addCommas(playerdata.LifetimeStatistics.Gathering.All.Total);
      //						var pvetot = addCommas(playerdata.LifetimeStatistics.PvE.Total);
      //						var deathtot = addCommas(playerdata.DeathFame);
      //					});
      //				} else{
      //					data.players.forEach(x=> {
      //						if (x.GuildName === null || x.GuildName === "") {
      //                            console.log(x.Name)
      //                            $("#player_results").append("<p><strong>"+x.Name+"</strong> ");
      //						} else {
      //                            console.log(x.Name)
      //                            console.log(x.GuildNameName)
      //					   }
      //                    });
      //                }
      //    });
});

app.get('/recipe', function (req, res) {
    var path = './public/items';
    let nom = [];
    fs.readdir(path, function (err, items) {
        for (var i = 0; i < items.length; i++) {
            nom.push(items[i]);
        }
        res.render('recipe', {select: nom, select1: null, iteminfo: null, prices: null,total:null,cost:null});
    })
});


app.post('/recipe', function (req, res) {
    let usefullItem = utils.getItemList(req.body.recipe_group.replace(".json",""));
    let recipeItems = [];
    let selectdata = [];
    usefullItem.forEach(x => {
        let enchant = x.UniqueName.substring(x.UniqueName.length, x.UniqueName.length - 2);
        let enchantment = "";
        if (enchant.includes("@1")) {
            enchantment = ".1";
        } else if (enchant.includes("@2")) {
            enchantment = ".2";
        } else if (enchant.includes("@3")) {
            enchantment = ".3";
        } else {
            enchantment = "flat";
        }
        selectdata = {
            UniqueName: x.UniqueName,
            FrName: x.LocalizedNames.find(x => x.Key == 'FR-FR').Value,
            enchant: enchantment
        }
        recipeItems.push(selectdata);
    })
    res.render('recipe', {select: null, select1: recipeItems, iteminfo: null, prices: null,total:null,enchant:null,cost:null});
});


app.post('/recipe2', function (req, res) {
    let itemdata = "";
    itemdata = req.body.recipe_item;
    var recipePromise = getRecipe(itemdata);
    let item = "";
    let costvalue = 0;
    // let costval;
    // var costPromise = utils.getPrice(itemdata);
    // costPromise.then(function(cost) {
    //   costData = JSON.parse(cost);
    //   costData.forEach( (w,i)=> {
    //     if (w.city === "Caerleon" && w.quality == 0 ) {
    //     var data = w.sell_price_min;
    //     console.log(data);
    //     costval = data;
    //     }
    //   })
    //   costvalue = utils.numberWithCommas(costval);
    //   console.log(costvalue);
    // }).catch(err => {
    //     console.log(err);
    //     res.render('index');
    // });

    recipePromise.then(function (recipe) {
        item = JSON.parse(recipe);
        let craftingList = []
        let enchant = "";
        if (itemdata.includes("@1")) {
              craftingList = item.enchantments.enchantments[0].craftingRequirements.craftResourceList;
              enchant = "@1";
          } else if (itemdata.includes("@2")) {
              craftingList = item.enchantments.enchantments[1].craftingRequirements.craftResourceList
              enchant = "@2";
          } else if (itemdata.includes("@3")) {
              craftingList = item.enchantments.enchantments[2].craftingRequirements.craftResourceList
              enchant = "@3";
          }else{
              craftingList = item.craftingRequirements.craftResourceList
          }
          Promise.all(craftingList.map(x=>utils.getPrice(x.uniqueName.includes("ARTEFACT")?x.uniqueName:x.uniqueName+enchant,"Caerleon"))).then( prix=>{
            prices = [].concat.apply([], prix.map(x => JSON.parse(x)));
            let newarray=[];
            craftingList.forEach( (y,i) => {
              if (prices[i] !== undefined){
                if ( y.uniqueName === prices[i].item_id || y.uniqueName ===  prices[i].item_id.substring(0,prices[i].item_id.length -2 )){
                  let obj0 = {
                  'prix': utils.numberWithCommas(prices[i].sell_price_min),
                  'date':prices[i].sell_price_min_date,
                  'name':y.uniqueName,
                  'count':y.count,
                  'total_price': utils.numberWithCommas(y.count * prices[i].sell_price_min),
                  'total_inter': y.count * prices[i].sell_price_min
                };
                newarray.push(obj0);
              }
            }
          });
          let total = 0;
          newarray.forEach(x=> {
            let valeur = x.total_inter
            total += valeur;
          })
          let readable_total = utils.numberWithCommas(total);
          res.render('recipe', {select: null, select1: null, iteminfo: item, prices: newarray,total:readable_total, enchant,cost:costvalue});
        }).catch(err => {
            console.log(err);
            res.render('index');
        })
    });
})

app.get('/bbiz', function (req, res) {
    res.render('bbiz', {select: jsonList, info: null, data: null, benefAskedAffichage: null, error: null});
})


app.post('/bbiz', function (req, res, body) {
    categoryAsked = req.body.bbiz_group;
    benefAsked = req.body.benef;
    usefullItem = utils.getItemList(categoryAsked.replace(".json",""));       // Obtain the list of items in the Select Category
    benefAskedAffichage = utils.numberWithCommas(benefAsked);
    Promise.all(usefullItem.map(x => bbizworthy(x, benefAsked))).then(data => {
        res.render('bbiz', {select: jsonList, info: categoryAsked, data, error: null, benefAskedAffichage});
    }).catch(err => {
        res.render('index');
    })
})


function getRecipe(itemname) {
    var url = `https://gameinfo.albiononline.com/api/gameinfo/items/${itemname}/data`;
    var options = {
        url: url,
        headers: {
            'User-Agent': 'request',
            'Access-Control-Allow-Origin': '*'
        }
    };
    return new Promise(function (resolve, reject) {
        request.get(options, function (err, resp, body) {
            if (err) {
                reject(err);
            } else {
                resolve(body);
            }
        })
    })
}

function bbizworthy(x, benefAsked) {
    return new Promise(function (resolve, reject) {
        let BM_prices = [];
        let BM_name = [];
        let BM_dates = [];
        let Ca_prices = [];
        let Ca_dates = [];
        let diffs = [];
        var q_level = [1, 2, 3, 4, 5];
        var q_text = ["None", "Normale", "Acceptable", "Admirable", "Formidable", "Exceptionnelle"];
        var dataPromise = utils.getPrice(x.UniqueName, "Caerleon,Black Market");
        let worth = [];
        dataPromise.then(function (resultats) {
            try {
                res = JSON.parse(resultats);
                res.forEach(y => {
                    switch (y.city) {
                        case "Black Market":
                            q_level.forEach(q => {
                                if (q === y.quality) {
                                    BM_prices[q] = y.buy_price_min
                                    BM_dates[q] = moment(y.buy_price_min_date)
                                    BM_name[q] = y.item_id

                                }
                            })
                            break;
                        case "Caerleon":
                            q_level.forEach(q => {
                                if (q === y.quality) {
                                    Ca_prices[q] = y.sell_price_min
                                    Ca_dates[q] = moment(y.sell_price_min_date)
                                }
                            })
                            break;
                    }
                });
                q_level.forEach(q => diffs[q] = Math.round(BM_prices[q] * .98) - Ca_prices[q]);
                if (diffs.some(diff => diff > 0)) {
                    q_level.forEach(q => {
                        // Benef > 10,000 !!!!!
                        if (BM_prices[q] && Ca_prices[q] && diffs[q] && diffs[q] > benefAsked) {

                            let enchant = BM_name[q].substring(BM_name[q].length, BM_name[q].length - 2);
                            // /console.log(enchant);
                            let enchantment = "";
                            if (enchant.includes("@1")) {
                                enchantment = ".1";
                            } else if (enchant.includes("@2")) {
                                enchantment = ".2";
                            } else if (enchant.includes("@3")) {
                                enchantment = ".3";
                            } else {
                                enchantment = "flat";
                            }
                            let donnee = {
                                //nom:BM_name[q],
                                nom: x.LocalizedNames.find(x => x.Key == 'FR-FR').Value,
                                src: "https://gameinfo.albiononline.com/api/gameinfo/items/" + BM_name[q] + "?quality=" + q,
                                //https://gameinfo.albiononline.com/api/gameinfo/items/T8_BAG?quality=5
                                // https://gameinfo.albiononline.com/api/gameinfo/items/+ BM_name[q].png?count=1&quality=4
                                enchant: enchantment,
                                tiers: BM_name[q].substring(0, 2),
                                qualite: q_text[q],
                                bm_prix: utils.numberWithCommas(BM_prices[q]),
                                bm_date: BM_dates[q].fromNow(),
                                ca_prix: utils.numberWithCommas(Ca_prices[q]),
                                ca_date: Ca_dates[q].fromNow(),
                                benef: utils.numberWithCommas(diffs[q])
                            };
                            worth.push(donnee);
                        }
                    })
                }
                resolve(worth);
            } catch (err) {
                reject(err);
            }
        }, e => reject(e));
    });
}

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Test app listening on port ${PORT}!`));
