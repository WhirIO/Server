'use strict';


let parse = require('./helpers/parse'),
    socketHelper = require('./helpers/socket'),
    uuid = require('uuid'),
    m = require('../models');

module.exports = {

    start: wss => {
        wss.on('connection', socket => {

            let args = parse.args(socket.upgradeReq);
            args.channel = args.channel || uuid.v4();
            args.username = args.username || uuid.v4();

            let update = {
                $setOnInsert: {
                    name: args.channel,
                    maxUsers: args.max || 1000
                }
            };

            m.channel.findOneAndUpdate({ name: args.channel }, update, { upsert: true, new: true })
                .exec()
                .then(channel => {

                    let userExists = channel.connectedUsers.find(user => {
                        return user.username === args.username;
                    });

                    if (userExists) {
                        return socketHelper.send(socket, {
                            status: 400,
                            channel: args.channel,
                            message: 'This username is already being used in this channel.'
                        }, true);
                    }

                    socket.currentChannel = channel.name;
                    socket.currentId = socketHelper.getId(socket, channel.name, args.username);
                    channel.connectedUsers.push({
                        username: args.username,
                        socketId: socket.currentId
                    });

                    channel.save(error => {
                        if (error) {
                            // Handle the error
                            error = null;
                        }

                        socketHelper.send(socket, {
                            channel: args.channel,
                            username: args.username,
                            message: `Welcome ${args.username} to channel ${args.channel} 👍🏼`
                        });
                    });
                })
                .catch(error => {
                    console.error(error);
                });
        });
    }
};
