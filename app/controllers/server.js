'use strict';


const co = require('co');
const bcrypt = require('promised-bcrypt');
const whir = _require('library/whir');
const m = _require('models').schemas;

module.exports.start = wss => {

    wss.on('connection', socket => {

        if (!socket.whir.session) {
            return whir.close(socket, {
                message: 'You need a valid session.',
                channel: socket.whir.channel
            });
        }

        const update = { $setOnInsert: {
            name: socket.whir.channel,
            'meta.owner': socket.whir.session
        }};

        co(function *() {

            const channel = yield m.channel
                .findOneAndUpdate({ name: socket.whir.channel }, update, { upsert: true, new: true })
                .exec();

            if (!channel.access.public) {
                if (!socket.whir.password) {
                    return whir.close(socket, {
                        message: 'This is a private channel; you need a password.',
                        channel: socket.whir.channel
                    });
                } else if (!(yield bcrypt.compare(socket.whir.password, channel.access.password))) {
                    return whir.close(socket, {
                        message: 'Your password does not match this channel\'s.',
                        channel: socket.whir.channel
                    });
                }
            }

            const userExists = channel.connectedUsers.find(user => user.user === socket.whir.user);
            if (userExists) {
                return whir.close(socket, {
                    message: 'This username is already in use in this channel.',
                    channel: socket.whir.channel
                });
            }

            channel.connectedUsers.push(socket.whir);
            channel.save(() => {
                whir.channel = socket.whir.channel;
                whir.send(socket, {
                        message: `Welcome to the _:channel:_ channel!`,
                        currentUsers: channel.connectedUsers
                            .map(user => user.user !== socket.whir.user ? user.user : null)
                            .filter(user => user)
                    })
                    .broadcast(wss.clients, {
                        user: socket.whir.user,
                        message: '-I joined the channel.-',
                        action: 'join'
                    }, socket);
            });
        });
    });

    wss.on('close', socket => {
        console.error('Socket closed!', socket);
    });
};
