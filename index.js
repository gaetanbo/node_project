const http = require('http');
const path = require('path');
const express = require('express');
const app = express();


const PORT = process.env.PORT || 3000;

app.get('/', function (req, res) {
    // Answer with homepage
    //res.end('Hello World')
});

// Set Static folder
app.use(express.static('public'));

// Init Middleware
// app.use(logger);
//app.get('/player/:id', function (req, res) {
//    res.send(req.params.id);
//})


app.get('/player', function (req, res) {
    res.sendFile(path.join(__dirname, 'public', 'player.html'));
});

app.get('/bbiz', function (req, res) {
    res.sendFile(path.join(__dirname, 'public', 'bbiz.html'));
});


app.listen(PORT, () => console.log(`Example app listening on port ${PORT}!`));

/*

    EXAMPLES FROM BEST PRATICE expressjs.com
app.get('/', function (req, res, next) {
	// do some sync stuff
	queryDb()
		.then(function (data) {
			// handle data
			return makeCsv(data)
		})
		.then(function (csv) {
			// handle csv
		})
		.catch(next)
})

app.use(function (err, req, res, next) {
	// handle error
})


 */