'use strict';


const fs = require('fs');
const mongoose = require('mongoose');
const config = _require('config');
const schemaPath = __dirname + '/schemas/';
const mongo = config.mongo;

let loadedModels = null;

module.exports = (function () {

    if (!loadedModels) {

        mongoose.connect(mongo.url, mongo.options);
        mongoose.connection.on('error', console.error.bind(console, 'DB connection error:'));
        mongoose.Promise = global.Promise;

        loadedModels = {};
        fs.readdirSync(schemaPath).forEach(file => {
            if (file.match(/(.+)\.js?$/)) {
                fs.stat(schemaPath + file, err => {
                    if (!err) {
                        loadedModels[file.replace('.js', '')] = require(schemaPath + file)(mongoose);
                    } else {
                        console.error('I was not able to find the', file, 'model.');
                    }
                });
            }
        });
    }

    loadedModels.objectId = mongoose.Types.ObjectId;
    return loadedModels;
}());
