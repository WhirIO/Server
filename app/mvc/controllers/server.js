'use strict';


let socketHelper = require('./helpers/socket'),
    m = require('../models');

module.exports = {

    start: wss => {
        wss.on('connection', socket => {

            let update = {
                    $setOnInsert: {
                        name: socket.whir.headers.channel,
                        maxUsers: socket.whir.headers.maxUsers
                    }
                };

            if (!socket.whir.headers.sessionId) {
                return socketHelper.send(socket, {
                    message: 'We need a valid session ID.',
                    close: true
                });
            }

            m.channel.findOneAndUpdate({ name: socket.whir.headers.channel }, update, { upsert: true, new: true })
                .exec()
                .then(channel => {

                    if (channel.connectedUsers.find(user => user.username === socket.whir.headers.username)) {
                        return socketHelper.send(socket, {
                            message: 'This username is already being used in this channel.',
                            close: true
                        });
                    }

                    socket.connectionChannel = channel.name;
                    socket.connectionSession = socket.whir.headers.sessionId;
                    channel.connectedUsers.push({
                        username: socket.whir.headers.username,
                        socketId: socket.whir.headers.sessionId
                    });

                    channel.save(error => {
                        if (error) {
                            // Handle the error
                            error = null;
                        }

                        socketHelper.send(socket, {
                            channel: socket.whir.headers.channel,
                            username: socket.whir.headers.username,
                            message: `Welcome to the _${socket.whir.headers.channel}_ channel!`
                        });
                        socketHelper.broadcast(wss.clients, socket.whir.headers.channel, socket.connectionSession, {
                            channel: socket.whir.headers.channel,
                            message: `_${socket.whir.headers.username}_ has joined.`
                        });
                    });
                })
                .catch(error => {
                    console.error(error);
                });
        });
    }
};
