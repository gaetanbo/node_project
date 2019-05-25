//const http = require('http');
//const path = require('path');
const bodyParser = require('body-parser');
const express = require('express');
const request = require('request');
const moment = require('moment');
const app = express();


app.use(express.static('public'));
app.use(bodyParser.urlencoded({extended: true}));
app.set('view engine', 'ejs');

let items_info = ('/public/ressources/items/');
console.log(items_info);


app.get('/', function (req, res) {
    res.render('index');
});

app.get('/recipe', function (req, res) {
    res.render('recipe');
});

app.post('/recipe', function (req, res) {
    res.render('recipe');
});

app.get('/player', function (req, res) {
    res.render('player');
});

app.post('/player', function (req, res) {
    res.render('player');
});

app.get('/guild', function (req, res) {
    res.render('guild');
});
app.post('/guild', function (req, res) {

});

app.get('/bbiz', function (req, res) {
    res.render('bbiz', {info: null, error: null});
});

app.post('/bbiz', function (req, res) {
    getItemsInfo();
    let itemAsked = req.body.item;
    //console.log(itemAsked);

    let url = `https://www.albion-online-data.com/api/v2/stats/prices/${itemAsked}`;
    request(url, function (err, response, body) {
        if (err) {
            res.render('bbiz', {info: null, error: 'Error please try again '});
        } else {
            let info = JSON.parse(body);
            // console.log(info);
            if (info[0] === undefined) {       // IS NOT AN ARRAY {
                res.render('bbiz', {info: null, error: 'Error,Item not Found ! '});
            } else {
                // On devrait commencer a comparer les prix ici !!
                let city_relevant_order = [];
                info.forEach(function (order) {
                    if (order.city == "Caerleon" || order.city == "Black Market") {
                        city_relevant_order.push(order)
                        // On a un tableau avec les order de BM et CA, faire les comparaisons dans le tableau avant de le passer au template

                        // Si je veux fecth licone de limage il faut que je le fasse ici et que j'envoie l'url en params sur mon render ?
                        // Pareil pour la date il faut que je la transforme avec moment ici avant de la passer en params sur mon render ?


                    } else {
                        // l'object n'a pas d'order au BM où à Caerleon donc on s'en fout
                    }
                });
                res.render('bbiz', {info: city_relevant_order, error: null});
            }
        }
    });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Test app listening on port ${PORT}!`));