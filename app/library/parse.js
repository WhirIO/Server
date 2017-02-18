'use strict';


const roli = attract('roli');

module.exports.headers = (socket, req, next) => {

    const headers = socket.upgradeReq.headers;
    socket.whir = {
        channel: headers['x-whir-channel'] || roli({ case: 'lower' }),
        user: headers['x-whir-user'],
        password: headers['x-whir-pass'] || null,
        session: headers['x-whir-session'] || null
    };

    next();
};
