'use strict';


let fs = require('fs'),
    config = require('../../config'),
    mongoose = require('mongoose'),
    loadedModels = null;

module.exports = (function () {

    var schemaPath = __dirname + '/schemas/',
        mongo = config.mongo;

    if (!loadedModels) {

        mongoose.connect(mongo.url, mongo.options);
        mongoose.connection.on('error', console.error.bind(console, 'DB connection error:'));
        mongoose.Promise = global.Promise;

        loadedModels = {};

        fs.readdirSync(schemaPath).forEach(file => {
            if (file.match(/(.+)\.js(on)?$/)) {
                if (fs.statSync(schemaPath + file)) {
                    loadedModels[file.replace('.js', '')] = require(schemaPath + file)(mongoose);
                } else {
                    console.error(`I was not able to find the ${file} model.`);
                }
            }
        });
    }

    loadedModels.objectId = mongoose.Types.ObjectId;
    return loadedModels;
}());
