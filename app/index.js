'use strict';


let message = require('./helpers/message'),
    express = require('express'),
    app = express(),
    port = process.env.PORT,
    parse = require('./helpers/parse'),
    server = require('express-ws')(app).getWss();


server.on('connection', socket => {
    // Check the username and channel here,
    // see if the user exists and so on.
    // Return the proper information.
    console.log('test', parse.args(socket.upgradeReq));
    socket.send(message.pack('server', 'developers', 'Welcome'), { binary: true, mask: true });
});

app.use(
    (req, res, next) => {
        res.setHeader('X-POWERED-BY', 'analogbird.com');
        return next();
    }
);

app.get('/', (req, res) => {
    res.send({});
});

app.ws('/', (ws) => {

    ws.on('message', data => {
        data = message.unpack(data);
        ws.send(message.pack('server', data.channel, 'I got your message.'), { binary: true, mask: true });
    });
});

app.listen(port, () => {
    console.log(`The app is up on port: ${port}`);
});
