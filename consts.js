const fs = require('fs');
const { join } = require("path")

const path = './public/data';

const consts = {
    path : {},
    categories : {},
    types : [],
    startup : function() {
        this.path = fs.readdirSync(path).filter(f => fs.lstatSync(join(__dirname,path,f)).isDirectory());
        for(folder of this.path){
            this.types.push(folder);
            for(file of (fs.readdirSync(path + "/" + folder)).map(x => x.replace(".json",""))){
                if(!this.path[folder])
                    this.path[folder] = {};
                this.path[folder][file] = path + "/" + folder + "/" + file + ".json";

                if(!this.categories[folder])
                    this.categories[folder] = [];
                this.categories[folder].push(file);
            }
        }
    }
}

module.exports = consts;