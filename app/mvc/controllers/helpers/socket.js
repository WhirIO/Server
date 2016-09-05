'use strict';


let message = require('./message');

module.exports = {

    send: (socket, data) => {

        if (data.close) {
            return socket.close(1011, data.message);
        }

        socket.send(message.pack(data), { binary: true, mask: true });
    }
};
