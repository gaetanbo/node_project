const fs = require('fs');
const request = require('request');

const utils = {
    getPrice : function(item, city) {
        var url = `https://www.albion-online-data.com/api/v2/stats/prices/${item}?locations=${city}`
        var options = {
            url: url,
            headers: {
                'User-Agent': 'request',
                'Access-Control-Allow-Origin': '*'
            }
        };
        //console.log(url);
        return new Promise(function (resolve, reject) {
            request.get(options, function (err, resp, body2) {
                if (err) {
                    reject(err);
                } else {
                    resolve(body2);
                }
            })
        })
    },
    getData : function(itemName) {
        var url = "https://www.albion-online-data.com/api/v2/stats/prices/" + itemName;
        var options = {
            url: url,
            headers: {
                'User-Agent': 'request',
                'Access-Control-Allow-Origin': '*'
            }
        };
        return new Promise(function (resolve, reject) {
            request.get(options, function (err, resp, body) {
                if (err) {
                    reject(err);
                } else {
                    resolve(body);
                }
            })
        })
    },
    getObjectList: function(jsonFile) {          // Doesnt return only flat item now, return all 120 weapons each time
        usefullItem = [];
        var fichier = './public/items/' + jsonFile;
        let rawcontent = fs.readFileSync(fichier);
        let contentFile = JSON.parse(rawcontent);
        contentFile.forEach(function (item, i) {
            let name = item.UniqueName;
            let tiers = name.substring(0, 2);
            if (tiers == "T1" || tiers == "T2" || tiers == "T3") {
                //console.log('bullshit tier');
            } else {
                usefullItem.push(item);
            }
        });
        return usefullItem
    },
    getJsonList : function () {
        let jsonList = [];
        let path = "./public/items/";
        fs.readdir(path, function (err, items) {
            items.forEach(function (item, i) {
                jsonList.push(item);
            })
        });
        return jsonList;
    },
    numberWithCommas: function(x) {
        var parts = x.toString().split(".");
        parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ",");
        return parts.join(".");
    }
}

module.exports = utils;