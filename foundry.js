const foundryRoute = require('express').Router();

foundryRoute.get('/foundry', (req, res) => {
    res.render('foundry');
})

module.exports = foundryRoute;