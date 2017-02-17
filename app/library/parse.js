'use strict';


const roli = attract('roli');

module.exports = {

    headers: (socket, req, next) => {

        const headers = socket.upgradeReq.headers;
        socket.whir = {
            user: headers['x-whir-user'],
            channel: headers['x-whir-channel'] || roli({ case: 'lower' }),
            session: headers['x-whir-session'] || null
        };

        if (socket.whir.session.length !== 64) {
            socket.whir.session = null;
        }

        next();
    }
};
