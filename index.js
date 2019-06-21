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
const charbuilderRoute = require("./charbuilder");
const marathonienRoute = require("./marathonien");
const blackBizRoute = require("./blackbiz");

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
app.use("/", charbuilderRoute);
app.use("/", marathonienRoute);
app.use("/", blackBizRoute);

app.get('/', function (req, res) {
    res.render('index');
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Test app listening on port ${PORT}!`));
