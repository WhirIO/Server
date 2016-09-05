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
            socketHelper.broadcast(req.app.locals.wss.clients,
                socket.connectionChannel,
                socket.whir.headers.sessionId,
                {
                    channel: data.channel,
                    sender: data.sender,
                    message: data.message
                });
        });
    }
};
