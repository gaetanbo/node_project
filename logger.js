const moment = require('moment');
moment.locale('fr');

const logger = (req, res, next) => {
    console.log(
        `${req.protocol}://${req.get('host')}${req.originalUrl}/${req.body.bbiz_group} @ ${moment().format("LLLL")}`
    );
    next();
};

module.exports = logger;