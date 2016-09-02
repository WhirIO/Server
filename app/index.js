'use strict';


let express = require('express'),
    app = express(),
    port = process.env.PORT,
    wss = require('express-ws')(app).getWss(),
    server = require('./mvc/controllers/server');

server.start(wss);
app.locals.wss = wss;
app.use(
    (req, res, next) => {
        res.setHeader('X-POWERED-BY', 'analogbird.com');
        next();
    },
    require('./router')(express)
);

app.listen(port, () => console.log(`Listening: ${port}`));
