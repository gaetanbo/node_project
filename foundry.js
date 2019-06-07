const foundryRoute = require('express').Router();
const rp = require('request-promise');

const traduction = { '@1' : "RUNE", '@2' : "SOUL", "@3" : "RELIC"};
const ratio = [
    {
        types : ["MAIN"],//one-handed weapons
        value : 72
    },
    {
        types : ["2H"],//two-handed weapons
        value : 96
    },
    {
        types : ["ARMOR","BAG"],// chests and bags
        value : 48
    },
    {
        types : ["SHOES","HEAD","OFF","CAPE"],// shoes, heads, offhand, and capes
        value : 24
    }
];

foundryRoute.get('/foundry', (req, res) => {

    res.render('foundry');
})

module.exports = foundryRoute;