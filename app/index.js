const config = require('./config');
const m = require('./models');
const Whir = require('./core/whir');

const color = { info: '\x1b[32m', warning: '\x1b[34m', error: '\x1b[33m' };
const log = (message, level) => {
  process.stdout.write(`${color[level]}[${level}] ${message}\x1b[0m\n\r`);
  if (level === 'error') {
    process.exit();
  }
};

/**
 * Pre-load the models, then boot the application.
 * @see models/index.js
 */
m.load(config.mongo).then(() => {
  const whir = new Whir({ port: process.env.PORT, redisConf: config.redis });
  whir.on('info', message => log(message, 'info'));
  whir.on('warning', message => log(message, 'warning'));
  whir.on('error', message => log(message, 'error'));
}).catch((error) => {
  log(error, 'error');
});
