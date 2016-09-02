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
            let connectionId = socketHelper.getId(socket, data.channel, data.sender);

            for (let client of req.app.locals.wss.clients) {
                if (client.currentChannel === socket.currentChannel && client.currentId !== connectionId) {
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
