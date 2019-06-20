const charbuilderRoute = require('express').Router();
const consts = require('./consts');
const utils = require('./utils');
const _types = consts.types;

const _cities = ["Caerleon","Thetford","Fort Sterling","Lymhurst","Bridgewatch","Martlock"];


charbuilderRoute.get('/charbuilder/query',(req,res) => {
    return res.status(200).json();
})


charbuilderRoute.get('/charbuilder',(req,res) => {
    res.render('charbuilder',{types:_types,cities: _cities})
})


module.exports = charbuilderRoute;