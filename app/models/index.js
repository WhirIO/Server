'use strict';


const fs = require('fs');
const events = require('events');
const mongoose = require('mongoose');
const config = _require('config');
const Models = function () {
    this.schemas = {};
    events.EventEmitter.call(this);
};

/**
 * Load all existing models.
 * Should be called only at boot time.
 */
Models.prototype.load = function () {

    mongoose.Promise = global.Promise;
    mongoose.connect(config.mongo.url, config.mongo.options);
    mongoose.connection.on('error', () => {
        this.emit('error', 'I can\'t connect to the DB.');
    });

    const schemaPath = `${__dirname}/schemas/`;
    fs.readdirSync(schemaPath).forEach(file => {
        if (file.match(/(.+)\.js$/)) {
            try {
                this.schemas[file.replace('.js', '')] = require(schemaPath + file)(mongoose);
            } catch (error) {
                this.emit('error', `I can\'t load model: ${file}`);
            }
        }
    });

    this.emit('loaded');
};

/**
 * Get any model, available after boot.
 * @see Models.prototype.load()
 */
Models.prototype.get = function (schema) {

    const loadedSchema = this.schemas[schema];
    if (!loadedSchema) {
        return this.emit('error', `A model for "${schema}" does not exist.`);
    }

    return loadedSchema;
};

require('util').inherits(Models, events.EventEmitter);
module.exports = new Models();
