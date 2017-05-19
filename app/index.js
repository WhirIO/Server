
const express = require('express');
const ews = require('express-ws');
const models = require('./models');
const router = require('./router');
const Socket = require('./core/socket');

const app = express();
models.on('error', (error) => {
  console.error(error);
  process.exit();
});

/**
 * Pre-load all existing models so they are available everywhere else in the application.
 * If loading succeeds, then continue loading the rest of the application.
 * This initial load relies on a synchronous call, only acceptable at boot time.
 * @see models/index.js
 */
models.on('loaded', () => {
  app.locals.socket = new Socket(ews(app).getWss());
  app.use(
        (req, res, next) => {
          res.setHeader('x-powered-by', 'github.com/aichholzer');
          next();
        },
        router(express),
        (req, res) => res.sendStatus(404).end()
    );

  app.listen(process.env.PORT, () => console.log(`Listening: ${process.env.PORT}`));
});

models.load();
