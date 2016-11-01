'use strict';


global._require = module => require(`${__dirname}/${module}`);

const express = require('express');
const app = express();
const wss = require('express-ws')(app).getWss();

/**
 * Pre-load all existing models so they are available everywhere else
 * in the application.
 * If loading succeeds, then continue loading the rest of the application.
 * This initial load relies on a synchronous call, only acceptable at boot time.
 * @see models/index.js
 */
const models = _require('models');
models.on('error', error => {
    console.error(error);
    process.exit();
});

models.on('loaded', () => {

    const server = _require('controllers/server');
    server.start(wss);
    app.locals.wss = wss;
    app.use(
        (req, res, next) => {
            res.setHeader('x-powered-by', 'analogbird.com');
            next();
        },
        _require('router')(express),
        (req, res) => res.sendStatus(404).end()
    );

    app.listen(process.env.PORT, () => console.log(`Listening: ${process.env.PORT}`));
});

models.load();
