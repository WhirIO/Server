'use strict';


let uuid = require('uuid'),
    headers = socket => {

        /**
         * TODO
         * Use roli.whir.io for a nice channel- and username.
         */
        let headers = {
            channel: socket.upgradeReq.headers['x-whir-channel'] || uuid.v4(),
            username: socket.upgradeReq.headers['x-whir-username'] || uuid.v4(),
            maxUsers: socket.upgradeReq.headers['x-whir-max-users'] || 1000,
            timeout: socket.upgradeReq.headers['x-whir-timeout'] || 0,
            sessionId: socket.upgradeReq.headers['x-whir-session-id'] || null
        };

        if (headers.sessionId.length !== 64) {
            headers.sessionId = null;
        }

        return headers;
    };

module.exports = {

    headers: headers,

    input: (socket, req, next) => {

        console.log('XXXXX');
        console.log(socket.upgradeReq.headers);

        socket.whir = {
            headers: headers(socket)
        }

        if (socket.whir.headers.sessionId.length !== 64) {
            socket.whir.headers.sessionId = null;
        }

        next();
    }
};
