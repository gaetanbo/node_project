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
    categoryAsked = req.body.bbiz_group;
    usefullItem=[];      // Empty list of items before call
    getObjectList(categoryAsked);       // Obtain the list of items in the Select Category
    bmca_result=[];
    Promise.all(usefullItem.map(x=> bbizworthy(x))).then(data => {
        console.log(data);
        res.render('bbiz', {select: jsonList, info: categoryAsked, data, error: null,});
    }).catch(err => {
        res.render('index');
    })
    //  LocalizedNames.find(x=>x.Key=='FR-FR');// Proper way to find the FR Name
})


function bbizworthy(x) {
    return new Promise(function(resolve,reject){
            let BM_prices = [];
            let BM_name = [];
            let BM_dates = [];
            let Ca_prices = [];
            let Ca_dates = [];
            let diffs = [];
            var q_level = [1, 2, 3, 4, 5];
            var q_text = ["None", "Normale", "Acceptable", "Admirable", "Formidable", "Exceptionnelle"];
        
        var dataPromise = getData(x.UniqueName);
        dataPromise.then(function (resultats) {
            try{
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
                        if (BM_prices[q] && Ca_prices[q] && diffs[q] && diffs[q] > 10000) {
                            let donnee = {
                                nom :BM_name[q],
                                qualite: q_text[q],
                                bm_prix: BM_prices[q],
                                bm_date: BM_dates[q].fromNow(),
                                ca_prix: Ca_prices[q], 
                                ca_date:Ca_dates[q].fromNow(), 
                                benef: diffs[q]
                            }
                            //bmca_result.push(BM_name[q], q_text[q], BM_prices[q], BM_dates[q].fromNow(), Ca_prices[q], Ca_dates[q].fromNow(), diffs[q]);
                            //console.log(donnee);
                            bmca_result.push(donnee);
                            
                           // console.log("Item " + BM_name[q] + " " + q_text[q] + " BM : " + numberWithCommas(BM_prices[q]) + " CA : " + numberWithCommas(Ca_prices[q]) + " Diff =  " + numberWithCommas(diffs[q]) + " @ " + Ca_dates[q].fromNow())
                        }
                    })
                }     
                //console.log(bmca_result);
                resolve (bmca_result);
    }  catch(err){
            reject(err);
        }
            
    }, e=>reject(e));
    });
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
    //console.log(err);
    reject(err);
};

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
    });
    return jsonList;
}

function numberWithCommas(x) {
    var parts = x.toString().split(".");
    parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ",");
    return parts.join(".");
}

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Test app listening on port ${PORT}!`));

