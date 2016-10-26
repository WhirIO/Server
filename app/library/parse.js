'use strict';


const roli = require('roli');

module.exports = {

    headers: (socket, req, next) => {

        const headers = socket.upgradeReq.headers;
        socket.whir = {
            user: headers['x-whir-user'],
            password: headers['x-whir-pass'] || null,
            channel: headers['x-whir-channel'] || roli({ case: 'lower' }),
            session: headers['x-whir-session'] || null
        };

        next();
    }
};
