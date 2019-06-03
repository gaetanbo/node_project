const moment = require('moment');
moment.locale('fr');

const logger = (req, res, next) => {
    console.log(
        `${req.protocol}://${req.get('host')}${req.originalUrl} @ ${moment().format("LLLL")}`
    );
    next();
};

module.exports = logger;