const fs = require('fs');
const mongoose = require('mongoose');

class Models {

  constructor() {
    this.schemas = {};
  }

  /**
   * Load all existing models.
   * Should be called only at boot time.
   */
  load({ url, options }) {
    return new Promise(async (yes, no) => {
      try {
        mongoose.Promise = global.Promise;
        await mongoose.connect(url, options);
      } catch (error) {
        return no('I can\'t connect to the database server.');
      }

      const schemaPath = `${__dirname}/schemas/`;
      fs.readdirSync(schemaPath).forEach((file) => {
        if (file.match(/(.+)\.js$/)) {
          try {
            const schema = require.call(null, `${schemaPath}${file}`);
            this.schemas[file.replace('.js', '')] = schema(mongoose);
          } catch (error) {
            return no(`I can't load model: ${error.stack}`);
          }
        }

        return true;
      });

      return yes();
    });
  }

  /**
   * Get any model, available after boot.
   * @see Models.load()
   */
  get(model) {
    return new Promise((yes, no) => {
      const loadedModel = this.schemas[model];
      if (!loadedModel) {
        return no(`The "${model}" model does not exist.`);
      }

      return yes(loadedModel);
    });
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
