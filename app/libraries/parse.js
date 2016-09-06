'use strict';


let uuid = require('uuid'),
    roli = require('roli');

module.exports = {

    headers: (socket, req, next) => {

        socket.whir = {
            headers: {
                channel: socket.upgradeReq.headers['x-whir-channel'] || roli({ separator: '' }),
                username: socket.upgradeReq.headers['x-whir-username'] || roli({ separator: '' }),
                maxUsers: socket.upgradeReq.headers['x-whir-max-users'] || 1000,
                timeout: socket.upgradeReq.headers['x-whir-timeout'] || 0,
                sessionId: socket.upgradeReq.headers['x-whir-session-id'] || null
            }
        };

        if (socket.whir.headers.sessionId.length !== 64) {
            socket.whir.headers.sessionId = null;
        }

        next();
    }
};
