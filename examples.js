//app.post('/',function(req,res){
//    res.send('post request to homepage')
//})
//app.get('/players/',function(req,res) {
//	res.send('players !')
//})
//Route Path : /users/:userId/books/:bookId
//Request Url : http://localhost:3000/users/34/books/7544
//req.params: {"userId": "34", "bookId": "7544"}
//app.get('/users/:userId/books/:bookId',function(req,res,next) {
//    console.log(('response send in next func')
//                next()
//},function(req,res){
//    res.send(req.params);
//})


// Set Static folder
//app.use(express.static('public'));

// Init Middleware
// app.use(logger);
//app.get('/player/:id', function (req, res) {
//    res.send(req.params.id);
//})


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

                §§§§§§§§§§§§§§§§§§§§§§§§§§§§§§§§§§§§§§
// var options = {
//     url: 'https://api.moncul.com',
//     headers: {
//         'User-Agent': 'request',
//         name: 'AGENT '
//     }
// };
                §§§§§§§§§§§§§§§§§§§§§§§§§§§§§§§§§§§§§§


 */


/***** FROM CODEPEN LADIV


 moment.locale('fr');

 function jq( myid ) {
    return myid.replace( /(:|\.|\[|\]|,|=|@)/g, "\\$1" );
}

 var q_level = [1,2,3,4,5];
 var q_text = ["None", "Normale","Acceptable","Admirable","Formidable","Exceptionnelle"];
 items.forEach(item => {
    /*
    let name = "";
    $.ajax({
       url: "https://gameinfo.albiononline.com/api/gameinfo/items/" + item + "/data",
       type: 'GET',
       dataType: 'json',
       headers: {
         'Access-Control-Allow-Origin': '*'
       },
       success: function(d){
          name = d.localizedNames['FR-FR'];
          console.log(name);
       }
    })
 */
/***** FROM CODEPEN LADIV


 $.get("https://www.albion-online-data.com/api/v2/stats/prices/" + item, function (d) {
    let BM_prices = [];
    let BM_dates = [];
    let Ca_prices = [];
    let Ca_dates = [];
    let diffs = [];
    d.forEach(x => {
        switch (x.city) {
            case "Black Market" :
                q_level.forEach(q => {
                    if (q == x.quality) {
                        BM_prices[q] = x.buy_price_min
                    }
                });
                q_level.forEach(q => {
                    if (q == x.quality) {
                        BM_dates[q] = moment(x.buy_price_min_date)
                    }
                });
                break;
            case "Caerleon" :
                q_level.forEach(q => {
                    if (q == x.quality) {
                        Ca_prices[q] = x.sell_price_min
                    }
                });
                q_level.forEach(q => {
                    if (q == x.quality) {
                        Ca_dates[q] = moment(x.sell_price_min_date)
                    }
                });
                break;
        }
    });
    q_level.forEach(q => diffs[q] = Math.round(BM_prices[q] * .98) - Ca_prices[q]);
    if (diffs.some(diff => diff > 0)) {
        $("#table_content").append("<tbody id=" + jq(item) + "></tbody>");
        $("#" + jq(item)).append("<tr><td rowspan=6><img width=\"64\" height=\"64\" title=" + name + " src=" + "  https://gameinfo.albiononline.com/api/gameinfo/items/" + item + "></img></td></tr>");
        $("#" + jq(item)).click(e => refresh(item));
        q_level.forEach(q => {
            if (BM_prices[q] && Ca_prices[q] && diffs[q] && diffs[q] > 0) {
                $("#" + jq(item)).append("<tr><td>" + q_text[q] + "</td><td>" + BM_prices[q] + " (" + BM_dates[q].fromNow() + ")" + "</td><td>" + Ca_prices[q] + " (" + Ca_dates[q].fromNow() + ")" + "</td><td style=" + (diffs[q] > 0 ? 'color:green' : 'color:red') + ">" + diffs[q] + "</td></tr>")
            } else {
                $("#" + jq(item)).append("<tr><td>" + q_text[q] + "</td></tr>");
            }
        });
    }
});
 })


 */

/**     PROMISES EXAMPLE 1        **/
/**
 var userDetails;

 function initialize() {
    var options = {
        url: 'https://api.github.com/users/narenaryan',
        headers: {
            'User-Agent': 'request'
        }
    };
    return new Promise(function (resolve, reject) {
        request.get(options, function (err, resp, body) {
            if (err) {
                reject(err);
            } else {
                resolve(JSON.parse(body));
            }
        })
    })
}

 function main() {
    var initializePromise = initialize();
    initializePromise.then(function (result) {
        userDetails = result;
        console.log("Initialized User Details");
        return userDetails;
    }, function (err) {
        console.log(err);
    }).then(function (result) {
        console.log(result.login + " " + result.public_gists);
    })
}

 main();
 **/
/**    END PROMISES EXAMPLE 1        **/


/**     PROMISES EXAMPLE 2       **/

var userDetails;

function getData(url) {
    var options = {
        url: url,
        headers: {
            'User-Agent': 'request'
        }
    };
    return new Promise(function (resolve, reject) {
        request.get(options, function (err, resp, body) {
            if (err) {
                reject(err)
            } else {
                resolve(body);
            }
        })
    })
}

var errHandler = function (err) {
    console.log(err);
}

function main() {
    var userProfileURL = "https://api.github.com/users/narenaryan";
    var dataPromise = getData(userProfileURL);
    dataPromise.then(JSON.parse, errHandler)
        .then(function (result) {
            userDetails = result;
            var anotherPromise = getData(userDetails.followers_url)
                .then(JSON.parse);
            return anotherPromise;
        }, errHandler).then(function (data) {
        console.log(data)
    }, errHandler);
}

**/
/**     END PROMISES EXAMPLE 2       **/


/**     PROMISES EXAMPLE 3       **/
/**
 var message = "";

 promise1 = new Promise((resolve, reject) => {
    setTimeout(() => {
        message += "my";
        resolve(message);
    }, 2000)
})

 promise2 = new Promise((resolve, reject) => {
    setTimeout(() => {
        message += " first";
        resolve(message);
    }, 2000)
})

 promise3 = new Promise((resolve, reject) => {
    setTimeout(() => {
        message += " promise";
        resolve(message);
    }, 2000)
})

 var printResult = (results) => {
    console.log("Results = ", results, "message = ", message)
}

 function main() {
    // See the order of promises. Final result will be according to it
    //Promise.all([promise1, promise2, promise3]).then(printResult);
    Promise.all([promise2]).then(printResult);
    Promise.all([promise3]).then(printResult);
    // Promise.all([promise3, promise2, promise1]).then(printResult);
    console.log("\"\"" + message);
}

 main();
 **/

/**     END PROMISES EXAMPLE 3       **/