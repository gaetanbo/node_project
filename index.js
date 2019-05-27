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

function numberWithCommas(x) {
    var parts = x.toString().split(".");
    parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ",");
    return parts.join(".");
}

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Test app listening on port ${PORT}!`));
