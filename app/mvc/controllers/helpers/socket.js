'use strict';


let message = require('./message'),
    send = (socket, data) => {
        if (data.close) {
            return socket.close(1011, data.message);
        }

        socket.send(message.pack(data), { binary: true, mask: true });
    };

module.exports = {

    send: send,

    broadcast: (clients, channel, session, payload) => {

        for (let client of clients) {
            if (client.connectionChannel === channel && client.connectionSession !== session) {
                send(client, payload);
            }
        }
    }
};
