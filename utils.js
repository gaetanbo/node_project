const fs = require('fs');
const request = require('request');

const utils = {
    getPrice : function(item, city, quality) {
        let q = quality?"&qualities="+quality:"";
        var url = `https://www.albion-online-data.com/api/v2/stats/prices/${item}?locations=${city}${q}`
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
                    resolve(JSON.parse(body));
                }
            })
        })
    },
    getData : function(itemName) {
        var url = `https://gameinfo.albiononline.com/api/gameinfo/items/${itemName}/data`;
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
                    resolve(JSON.parse(body));
                }
            })
        })
    },
    getItemList: function(name){
        return this.getObjectList("items/" + name);
    },
    getRessourceList: function(name){
        return this.getObjectList("ressources/" + name);
    },
    getObjectList: function(jsonFile) {          // Doesnt return only flat item now, return all 120 weapons each time
        usefullItem = [];
        var fichier = './public/' + jsonFile + ".json";
        let rawcontent = fs.readFileSync(fichier);
        let contentFile = JSON.parse(rawcontent);
        return contentFile.filter(item => { let tiers = item.UniqueName.substring(0, 2); return (tiers != "T1" && tiers != "T2" && tiers != "T3") }) 
    },
    getJsonList : function () {
        let jsonList = [];
        let files = fs.readdirSync("./public/items/")
        return files;
    },
    numberWithCommas: function(x) {
        var parts = x.toString().split(".");
        parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ",");
        return parts.join(".");
    }
}

module.exports = utils;