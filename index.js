const bodyParser = require('body-parser');
const express = require('express');
const request = require('request');
const moment = require('moment');
const app = express();
const fs = require('fs');
const logger = require('./logger');

// Add my services / function I need from other files
const consts = require("./consts");
const utils = require("./utils");

// Add my routes from declared from other files
const foundryRoute = require("./foundry");
const recipeRoute = require("./recipe");
const marathonienRoute = require("./marathonien");

moment.locale('fr');
consts.startup();

app.use(express.static('public'));
app.use(bodyParser.urlencoded({extended: true}));
app.use(logger);
app.set('view engine', 'ejs');

// Initialize var for .get/bbiz :
let categoryAsked = "";

app.use("/", foundryRoute);
app.use("/", recipeRoute);
app.use("/", marathonienRoute);

app.get('/', function (req, res) {
    res.render('index');
});



app.get('/bbiz', function (req, res) {
    res.render('bbiz', {select: consts.categories["melee"], info: null, data: null, benefAskedAffichage: null, error: null});
})


app.post('/bbiz', function (req, res, body) {
    categoryAsked = req.body.bbiz_group;
    benefAsked = req.body.benef;
    usefullItem = utils.getObjectList(categoryAsked, "melee");       // Obtain the list of items in the Select Category
    benefAskedAffichage = utils.numberWithCommas(benefAsked);
    Promise.all(usefullItem.map(x => bbizworthy(x, benefAsked))).then(data => {
        res.render('bbiz', {select: consts.categories["melee"], info: categoryAsked, data, error: null, benefAskedAffichage});
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
                resultats.forEach(y => {
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
