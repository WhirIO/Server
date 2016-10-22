'use strict';


const uuid = require('uuid');
const roli = require('roli');

module.exports = {

    headers: (socket, req, next) => {

        const headers = socket.upgradeReq.headers;
        socket.whir = {
            user: headers['x-whir-user'],
            channel: headers['x-whir-channel'] || roli({ separator: '' }),
            maxUsers: headers['x-whir-max'] || 1000,
            timeOut: headers['x-whir-timeout'] || 0,
            session: headers['x-whir-session'] || null
        };

        if (socket.whir.session.length !== 64) {
            socket.whir.session = null;
        }

        next();
    }
};
