'use strict';


global._require = module => require(`${__dirname}/${module}`);
const express = require('express');
const app = express();
const wss = require('express-ws')(app).getWss();
const server = _require('controllers/server');

server.start(wss);
app.locals.wss = wss;
app.use(
    (req, res, next) => {
        res.setHeader('X-POWERED-BY', 'analogbird.com');
        next();
    },
    _require('router')(express)
);

app.listen(process.env.PORT, () => console.log(`Listening: ${process.env.PORT}`));
