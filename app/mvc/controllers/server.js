'use strict';


let socketHelper = require('./helpers/socket'),
    parse = require('../../libraries/parse'),
    m = require('../models');

module.exports = {

    start: wss => {
        wss.on('connection', socket => {

            console.log('ZZZZZZ');
            console.log(JSON.stringify());

            let headers = parse.headers(socket.upgradeReq.headers),
                update = {
                    $setOnInsert: {
                        name: headers.channel,
                        maxUsers: headers.maxUsers
                    }
                };

            if (!headers.sessionId) {
                return socketHelper.send(socket, {
                    message: 'We need a valid session ID.',
                    close: true
                });
            }

            m.channel.findOneAndUpdate({ name: headers.channel }, update, { upsert: true, new: true })
                .exec()
                .then(channel => {

                    if (channel.connectedUsers.find(user => user.username === headers.username)) {
                        return socketHelper.send(socket, {
                            message: 'This username is already being used in this channel.',
                            close: true
                        });
                    }

                    socket.connectionChannel = channel.name;
                    socket.connectionSession = headers.sessionId;
                    channel.connectedUsers.push({
                        username: headers.username,
                        socketId: headers.sessionId
                    });

                    channel.save(error => {
                        if (error) {
                            // Handle the error
                            error = null;
                        }

                        socketHelper.send(socket, {
                            channel: headers.channel,
                            username: headers.username,
                            message: `Welcome to the _${headers.channel}_ channel!`
                        });
                        socketHelper.broadcast(wss.clients, headers.channel, socket.connectionSession, {
                            channel: headers.channel,
                            message: `_${headers.username}_ has joined.`
                        });
                    });
                })
                .catch(error => {
                    console.error(error);
                });
        });
    }
};
