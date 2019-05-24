const http = require('http')
const express = require('express')
const app = express()

app.use(express.static('public'))
const PORT = process.env.PORT || 3000;

app.get('/', function (req, res) {
    // Answer with homepage
    res.end('public', index.hmtl);
    //res.end('Hello World')
})


app.listen(PORT, function () {
    console.log(`Example app listening on port ${PORT}!`);
})

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