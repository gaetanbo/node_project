//const http = require('http');
//const path = require('path');
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

let usefullItem = [];
let worthyOrder = [];
let bbizerror = "";
let BM_prices = [];
let BM_dates = [];
let CA_prices = [];
let CA_dates = [];
var q_level = [1, 2, 3, 4, 5];
var q_text = ["None", "Normale", "Acceptable", "Admirable", "Formidable", "Exceptionnelle"];
let diffs = [];
moment.locale('fr');


app.get('/', function (req, res) {
    console.log('requested home');
    res.render('index');
});
app.get('/recipe', function (req, res) {
    console.log('requested recipe');
    res.render('recipe');
});
app.post('/recipe', function (req, res) {
    res.render('recipe');
});
app.get('/player', function (req, res) {
    console.log('requested player');
    res.render('player');
});
app.post('/player', function (req, res) {
    res.render('player');
});
app.get('/guild', function (req, res) {
    console.log('requested guild');
    res.render('guild');
});
app.post('/guild', function (req, res) {
});


app.get('/bbiz', function (req, res) {
    //    let items_file = ('./public/items/tank.json');
    var path = './public/items';
    let nom = [];
    fs.readdir(path, function (err, items) {
        //console.log(items);
        for (var i = 0; i < items.length; i++) {
            // console.log(err);
            nom.push(items[i]);
        }
        //console.log(nom)
        res.render('bbiz', {info: null, error: null, select: nom});

    })
    console.log('requested bbiz');
    // console.log(nom);
});
app.post('/bbiz', function (req, res) {
    let itemAsked = req.body.item;
    //let groupAsked = req.body.bbiz_group;
    //console.log(groupAsked);
    let url = `https://www.albion-online-data.com/api/v2/stats/prices/${itemAsked}`;
    request(url, function (err, response, body) {
        if (err) {
            // reponse.statusCode === 200
            // On ne catch pas les err atm !!
            res.render('bbiz', {info: null, select: null, error: 'Error please try again '});
        } else {
            let info = JSON.parse(body);
            // console.log(info);
            if (info[0] === undefined) {       // IS NOT AN ARRAY {
                res.render('bbiz', {info: null, select: null, error: 'Error,Item not Found ! '});
            } else {
                // On devrait commencer a comparer les prix ici !!
                let city_relevant_order = [];
                info.forEach(function (order) {
                    if (order.city == "Caerleon" || order.city == "Black Market") {
                        //console.log(numberWithCommas(order.buy_price_min));
                        // ça serait possible de mettre les virgules de l'affichage une fois sur l'ejs ? Ou il faut refaire le tableau en
                        //passant les middleware numberWithCommas et moment maintenant ?
                        // Si je veux fecth licone de limage il faut que je le fasse ici et que j'envoie l'url en params sur mon render ?
                        // Pareil pour la date il faut que je la transforme avec moment ici avant de la passer en params sur mon render ?

                        city_relevant_order.push(order)
                        // On a un tableau avec les order de BM et CA, faire les comparaisons dans le tableau avant de le passer au template
                    } else {
                        // l'object n'a pas d'order au BM où à Caerleon donc on s'en fout
                    }
                });
                res.render('bbiz', {info: city_relevant_order, select: null, error: null});
            }
        }
    });
});


app.get('/bbiz2', function (req, res) {
    var path = './public/items';
    let nom = [];
    // Il faudrait que les valeurs du select soit aussi présentes sur la page de réponse get, pour pouvoir refaire des posts à la suite
    fs.readdir(path, function (err, items) {
        for (var i = 0; i < items.length; i++) {
            nom.push(items[i]);
        }
        res.render('bbiz2', {select1: nom, error: null, categoryName: null, data: null});
    });
    console.log('requested bbiz2');
});

app.post('/bbiz2', function (req, res) {
    let groupAsked = req.body.bbiz_group;
    let cat = groupAsked.substring(0, groupAsked.length - 5);
    getObjectList(groupAsked);
    //console.log(usefullItem[10]);
    bbizWorthy("T4_ARMOR_LEATHER_SET1");
    //               // Commented the loop on all items to not run a thousand query on each try
    //          //              usefullItem.forEach(function (itemName, i) {
    //          //              console.log(itemName.UniqueName);
    //          //              bbizWorthy(itemName.UniqueName);
    // if (bbizerror !== null) {
    //     res.render('bbiz2', {select1: null, error: bbizerror, categoryName: cat, data: null});
    // } else
    if (worthyOrder !== null) {
        res.render('bbiz2', {select1: null, error: null, categoryName: cat, data: worthyOrder});
    }
    // })
});


function getObjectList(jsonFile) {
    usefullItem = [];
    var fichier = './public/items/' + jsonFile;
    let rawcontent = fs.readFileSync(fichier);
    let contentFile = JSON.parse(rawcontent);
    contentFile.forEach(function (item, i) {
        let name = item.UniqueName;
        let tiers = name.substring(0, 2);
        if (tiers == "T1" || tiers == "T2" || tiers == "T3") {
            //console.log('bullshit tier');
        } else {
            let enchant = name.substring(name.length, name.length - 2);
            if (enchant.includes("@1")) {
                //console.log("its .1 !");
            } else if (enchant.includes("@2")) {
                //console.log("its .2 !");
            } else if (enchant.includes("@3")) {
                //console.log("its .3 !");
            } else {
                usefullItem.push(item);
                //               console.log("its flat !");
                //              console.log(usefullItem);
            }
        }
    });
    return usefullItem
}


function numberWithCommas(x) {
    var parts = x.toString().split(".");
    parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ",");
    return parts.join(".");
}

function bbizWorthy(itemname) {
    //bbizerror = "";
    let url = `https://www.albion-online-data.com/api/v2/stats/prices/${itemname}`;
    request(url, function (err, response, body) {
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
                console.log(BM_prices);
                console.log(CA_prices);

            }
        }
    });
}

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Test app listening on port ${PORT}!`));

