const bodyParser = require('body-parser');
const express = require('express');
const request = require('request');
const moment = require('moment');
const app = express();
const fs = require('fs');
const logger = require('./logger');

moment.locale('fr');
app.use(express.static('public'));
app.use(bodyParser.urlencoded({extended: true}));
app.use(logger);
app.set('view engine', 'ejs');

// Initialize the list of JSON file on server
let jsonList = [];
getJsonList();
// Initialize var for .get/bbiz :
let categoryAsked = "";
let usefullItem = [];
let bmca_result = [];


app.get('/', function (req, res) {
    res.render('index');
});

app.get('/bbiz', function (req, res) {
    res.render('bbiz', {select: jsonList, info: null, data: null, error: null});
})


app.post('/bbiz', function (req, res, body) {
    // Need to handle err in case we dont catch json ?
    categoryAsked = req.body.bbiz_group;
    usefullItem.splice(0, usefullItem.length);      // Empty list of items before call
    getObjectList(categoryAsked);       // Obtain the list of items in the Select Category
    bmca_result.splice(0, bmca_result.length);
    usefullItem.forEach(x => {
        //                    //  ICI On devrait attendre le result de chaque bbizworthy(x) et les ajouter au fur et à mesure a lobj 'data' du render
        //                    // Mais le render se fait avant la réponse de bbizworthy :(
        bbizworthy(x)
    });
    console.log('res : ' + bmca_result);
    res.render('bbiz', {select: jsonList, info: categoryAsked, data: null, error: null,});

    console.log(usefullItem.length + " items trouvés !");
})


function bbizworthy(x) {
    if (
        x.Index === "2560" ||
        x.Index === "2561" ||
        x.Index === "2562" ||
        x.Index === "2563" ||
        x.Index === "2624" ||
        x.Index === "2625" ||
        x.Index === "2626" ||
        x.Index === "2634" ||
        x.Index === "2633" ||
        x.Index === "2632" || x.Index === "2631") {  // Pour empecher de tourner sur tous les items à chaque test 2631-> 2634 = T8_ARMOR_LEATHER_SET2 -> T8_ARMOR_LEATHER_SET2@3
        let BM_prices = [];
        let BM_name = [];
        let BM_dates = [];
        let Ca_prices = [];
        let Ca_dates = [];
        let diffs = [];
        var q_level = [1, 2, 3, 4, 5];
        var q_text = ["None", "Normale", "Acceptable", "Admirable", "Formidable", "Exceptionnelle"];

        var dataPromise = getData(x.UniqueName);
        dataPromise.then(JSON.parse, errHandler)
            .then(function (result) {
                result.forEach(x => {
                    switch (x.city) {
                        case "Black Market" :
                            q_level.forEach(q => {
                                if (q == x.quality) {
                                    BM_prices[q] = x.buy_price_min
                                    BM_name[q] = x.item_id
                                    // console.log((BM_name[q]));
                                }
                            });
                            q_level.forEach(q => {
                                if (q == x.quality) {
                                    BM_dates[q] = moment(x.buy_price_min_date)
                                }
                            });
                            break;
                        case "Caerleon" :
                            q_level.forEach(q => {
                                if (q == x.quality) {
                                    Ca_prices[q] = x.sell_price_min
                                }
                            });
                            q_level.forEach(q => {
                                if (q == x.quality) {
                                    Ca_dates[q] = moment(x.sell_price_min_date)
                                }
                            });
                            break;
                    }
                });
                q_level.forEach(q => diffs[q] = Math.round(BM_prices[q] * .98) - Ca_prices[q]);
                if (diffs.some(diff => diff > 0)) {
                    q_level.forEach(q => {
                        if (BM_prices[q] && Ca_prices[q] && diffs[q] && diffs[q] > 0) {
                            console.log("BM : " + BM_prices[q]);
                            bmca_result.push(BM_prices[q], BM_dates[q], Ca_prices[q], Ca_dates[q], diffs[q], q, BM_name[q]);
                            //bmca_result.push(BM_name[q], BM_prices[q], Ca_prices[q], diffs[q], q);
                        }
                    });
                }
                //console.log(bmca_result);
                return bmca_result;
            }, errHandler);
    }
}

function getData(itemName) {
    var url = "https://www.albion-online-data.com/api/v2/stats/prices/" + itemName;
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

var errHandler = function (err) {
    console.log(err);
}

function getObjectList(jsonFile) {          // Doesnt return only flat item now, return all 120 weapons each time
    var fichier = './public/items/' + jsonFile;
    let rawcontent = fs.readFileSync(fichier);
    let contentFile = JSON.parse(rawcontent);
    contentFile.forEach(function (item, i) {
        let name = item.UniqueName;
        let tiers = name.substring(0, 2);
        if (tiers == "T1" || tiers == "T2" || tiers == "T3") {
            //console.log('bullshit tier');
        } else {
            usefullItem.push(item);
            //let enchant = name.substring(name.length, name.length - 2);
            // if (enchant.includes("@1")) {
            //     //console.log("its .1 !");
            // } else if (enchant.includes("@2")) {
            //     //console.log("its .2 !");
            // } else if (enchant.includes("@3")) {
            //     //console.log("its .3 !");
            // } else {
            //     usefullItem.push(item);
            //     //               console.log("its flat !");
            //     //              console.log(usefullItem);
            // }
        }
    });
    return usefullItem
}

function getJsonList() {
    console.log('called getJsonList()');
    let path = "./public/items/";
    fs.readdir(path, function (err, items) {
        items.forEach(function (item, i) {
            jsonList.push(item);
        })
    })
    return jsonList;
}

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Test app listening on port ${PORT}!`));

