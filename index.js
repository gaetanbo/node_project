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

app.get('/', function (req, res) {
    res.render('index');
});


app.get('/player', function (req, res) {
    res.render('player');
});

app.get('/bbiz', function (req, res) {
    res.render('bbiz', {info: null, itemName: null, error: null});
});

app.post('/bbiz', function (req, res) {
    let itemAsked = req.body.item;
    //console.log(itemAsked);

    let url = `https://www.albion-online-data.com/api/v2/stats/prices/${itemAsked}`;
    request(url, function (err, response, body) {
        if (err) {
            res.render('bbiz', {info: null, itemName: null, error: 'Error please try again '});
        } else {
            let info = JSON.parse(body);
            //console.log(info[0]);
            if (info[0] === undefined) {       // IS NOT AN ARRAY {
                res.render('bbiz', {info: null, itemName: null, error: 'Error,Item not Found ! '});
            } else {
                // On devrait commencer a comparer les prix ici !!
                res.render('bbiz', {info: info, itemName: itemAsked, error: null});
            }
        }
    });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Test app listening on port ${PORT}!`));