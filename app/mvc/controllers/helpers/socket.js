'use strict';


let crypto = require('crypto'),
    message = require('./message');

module.exports = {

    getId: (socket, channel, sender) => {

        let remoteAddress = socket.upgradeReq.connection.remoteAddress,
            remotePort = socket.upgradeReq.connection.remotePort,
            hashData = `${remoteAddress}:${remotePort}:${channel || ''}:${sender || ''}`;

        return crypto.createHash('RSA-SHA1').update(hashData, 'utf8').digest('hex');
    },

    send: (socket, data, close) => {

        if (close) {
            return socket.close(1011, data.message);
        }

        socket.send(message.pack(data), { binary: true, mask: true });
    }
};
