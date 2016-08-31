'use strict';


let chat = require('./helpers/chat'),
    express = require('express'),
    app = express(),
    port = process.env.PORT;

require('express-ws')(app);
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
        console.log(chat.unpack(data));
        ws.send(chat.pack('general', 'I got your message.'));
    });
});

app.listen(port, () => {
    console.log(`The app is up on port: ${port}`);
});
