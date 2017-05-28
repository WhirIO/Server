const config = require('./config');
const m = require('./models');
const Whir = require('./core/whir');

/**
 * Pre-load the models, then boot the application.
 * @see models/index.js
 */
m.load(config.mongo).then(() => {
  const whir = new Whir({ port: process.env.PORT });
  whir.on('info', (message) => {
    console.log(message);
  });

  whir.on('error', (message) => {
    console.error(message);
  });
}).catch((error) => {
  console.error(error);
  process.exit();
});
