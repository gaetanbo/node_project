const bodyParser = require('body-parser');
const express = require('express');
const request = require('request');
const moment = require('moment');
const app = express();
const fs = require('fs');
//console.log(process.env.USER)


app.use(express.static('public'));
app.use(bodyParser.urlencoded({extended: true}));
app.set('view engine', 'ejs');
moment.locale('fr');


// Let declarations
let usefullItem = [];           // for  getObjectList()
let nom = [];                    // Tableau contenant le nom de chaque fichier json (used in createSelect() )


//let item_compo =[];     // used for recipe 2
let worthyOrder = [];
let bbizerror = "";
let BM_prices = [];
let BM_dates = [];
let CA_prices = [];
let CA_dates = [];
var q_level = [1, 2, 3, 4, 5];
var q_text = ["None", "Normale", "Acceptable", "Admirable", "Formidable", "Exceptionnelle"];
let diffs = [];


app.get('/', function (req, res) {
    console.log('requested home');
    res.render('index');
});


app.get('/bbiz2', function (req, res) {
    console.log('requested bbiz2');
    createSelect();
    res.render('bbiz2', {select1: nom, databank: null, error: null, categoryName: null, data: null});
});

app.post('/bbiz2', function (req, res) {
    console.log('posted bbiz2');
    worthyOrder = [];
    createSelect();
    let rlyUsefullItem = [];
    let catAsked = req.body.bbiz_group;
    usefullItem.splice(0, usefullItem.length);      // Empty UsefullItem Array
    getObjectList(catAsked);
    console.log(usefullItem.length);
    usefullItem.forEach(x => {
        //console.log(x.UniqueName);
    });
    // usefullItem.forEach(x => {
    //     console.log(x.UniqueName);
    //     bbizWorthy(x.UniqueName);
    //     console.log("worthy : " + worthyOrder);
    //     // if (x.UniqueName == worthyOrder[0]) {
    //     //     //console.log(x);
    //     //     rlyUsefullItem.push(x);
    //     // } else {
    //     //     //console.log("Item infos not found");
    //     // }
    // });

    res.render('bbiz2', {
        select1: nom,
        error: null,
        categoryName: catAsked,
        data: worthyOrder,
        databank: rlyUsefullItem
    });


    // Ajouter ici la function pour chopper les url des img ?
    //console.log(usefullItem);     // usefullItem === Liste de tous les items présents dans le JSON demandé
    //  usefullItem.LocalizedNames[2].Value        -> Nom FR pour l'affichage
    //  usefullItem.UniqueName                     -> Nom  pour la price query
    // faire une boucle sur chaque usefullItem
    // dedans fetch les prix BM et CA, les comparer et push dans un tableau ceux interessant
    // retourner au render seulement les usefullItem dans le nouveau tableau
    //nouveau tableau ===  Faire un fat tableau qui contient toutes les réponses positive au test BM/CA

});


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

function createSelect() {
    //console.log("nom  : " + nom);
    let path = "./public/items/";
    fs.readdir(path, function (err, items) {
        items.forEach(function (item, i) {
            nom.push(item);
        })
    })
    return nom;
}

function numberWithCommas(x) {
    var parts = x.toString().split(".");
    parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ",");
    return parts.join(".");
}

function bbizWorthy(itemname) {
    bbizerror = "";
    let url = `https://www.albion-online-data.com/api/v2/stats/prices/${itemname}`;
    request(url, function (err, response, body) {
        if (response.statusCode !== 200) {
            console.log('Error ! ');
            //console.log(response.statusCode);
        }
        if (err) {
            bbizerror = "Internal Error";
            console.log('Internal Error');
            return bbizerror;
        } else {
            let marketdata = JSON.parse(body);
            if (marketdata[0] === undefined) {
                bbizerror = "Item not Found";
                console.log('Item not found');
                return bbizerror;
            } else {
                //console.log(marketdata);
                marketdata.forEach(x => {
                    switch (x.city) {
                        case "Black Market":
                            q_level.forEach(q => {
                                if (q == x.quality) {
                                    BM_prices[q] = x.buy_price_min;
                                }
                            });
                            q_level.forEach(q => {
                                if (q == x.quality) {
                                    BM_dates[q] = moment(x.buy_price_min_date);
                                }
                            });
                            break;
                        case "Caerleon":
                            q_level.forEach(q => {
                                if (q == x.quality) {
                                    CA_prices[q] = x.sell_price_min;
                                }
                            });
                            q_level.forEach(q => {
                                if (q == x.quality) {
                                    CA_dates[q] = moment(x.sell_price_min_date);
                                }
                            });
                            break;
                    }
                });
                q_level.forEach(q => diffs[q] = Math.round(BM_prices[q] * .98) - CA_prices[q]);
                if (diffs.some(diff => diff > 0)) {
                    q_level.forEach(q => {
                        //console.log("q : " + q);
                        //console.log("diffs[q] : " + diffs[q]);
                        if (BM_prices[q] && CA_prices[q] && diffs[q] && diffs[q] > 0) {
                            //console.log(diffs[q]);
                            var src = "https://gameinfo.albiononline.com/api/gameinfo/items/" + itemname
                            worthyOrder.push(itemname, src, BM_prices[q], CA_prices[q], diffs[q], q);
                        } else {
                            //  console.log('no worthy order');
                        }
                        //console.log(worthyOrder);
                        return worthyOrder;
                    });
                } else {
                    //console.log("something wrong ?");
                }
            }
        }
    });
}


const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Test app listening on port ${PORT}!`));

