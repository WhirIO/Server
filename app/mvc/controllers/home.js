'use strict';


let message = require('./helpers/message'),
    socketHelper = require('./helpers/socket');

module.exports = {

    home: (req, res) => {
        res.send({});
    },

    message: (socket, req) => {

        socket.on('message', data => {

            data = message.unpack(data);
            let connectionSession = socket.whir.headers.sessionId;

            for (let client of req.app.locals.wss.clients) {
                if (client.connectionChannel === socket.connectionChannel && client.connectionSession !== connectionSession) {
                    socketHelper.send(client, {
                        channel: data.channel,
                        sender: data.sender,
                        message: data.message
                    });
                }
            }
        });
    }
};
