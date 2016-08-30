'use strict';


let config = require('./config'),
    chat = require('./helpers/chat'),
    net = require('net'),
    options = {
        port: config.port,
        host: config.host
    },
    server = new net.Server(socket => {
        socket.hash = `${socket.remoteAddress}:${socket.remotePort}`;

        socket.write(chat.pack('general', `Hello ${socket.hash}`));
        socket.on('data', data => {
            console.log(chat.unpack(data));
            socket.write(chat.pack('general', 'I, the server, received your message.'));
        });

        socket.on('end', () => {
            // Remove this client from the clients store.
            // Let all others know that this user is gone.
        });
    });

server.listen(options, () => {
    console.log(`I'm listening: ${server.address()}`);
});
