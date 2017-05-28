const config = require('../config');
const Emitter = require('events');
const fs = require('fs');
const mongoose = require('mongoose');

class Models extends Emitter {

  constructor() {
    super();
    this.schemas = {};
  }

  /**
   * Load all existing models.
   * Should be called only at boot time.
   */
  load() {
    mongoose.Promise = global.Promise;
    mongoose.connect(config.mongo.url, config.mongo.options);
    mongoose.connection.on('error', () => {
      this.emit('error', 'I can\'t connect to the database.');
    });

    const schemaPath = `${__dirname}/schemas/`;
    fs.readdirSync(schemaPath).forEach((file) => {
      if (file.match(/(.+)\.js$/)) {
        try {
          const schema = require.call(null, `${schemaPath}${file}`);
          this.schemas[file.replace('.js', '')] = schema(mongoose);
        } catch (error) {
          this.emit('error', `I can't load model: ${error.stack}`);
        }
      }
    });

    this.emit('loaded');
  }

  /**
   * Get any model, available after boot.
   * @see Models.load()
   */
  get(schema) {
    const loadedSchema = this.schemas[schema];
    if (!loadedSchema) {
      return this.emit('error', `The "${schema}" model does not exist.`);
    }

    return loadedSchema;
  }
}

module.exports = new Proxy(new Models(), {
  get: (target, name) => {
    if (target.schemas[name]) {
      return target.schemas[name];
    }

    return target[name];
  }
});
