'use strict';


const co = require('co');
const whir = _require('library/whir');
const m = _require('models');

module.exports.start = wss => {

    wss.on('connection', socket => {

        if (!socket.whir.session) {
            return whir.send(socket, {
                message: 'I need a valid session ID.',
                close: true
            });
        }

        const update = {
            $setOnInsert: {
                name: socket.whir.channel,
                maxUsers: socket.whir.maxUsers
            }
        };

        co(function* () {

            const channel = yield m.channel
                .findOneAndUpdate({ name: socket.whir.channel }, update, { upsert: true, new: true })
                .exec();

            const userExists = channel.connectedUsers.find(user => user.user === socket.whir.user);
            if (userExists) {
                return whir.close(socket, 'This user is already in use in this channel.');
            }

            channel.connectedUsers.push(socket.whir);
            channel.save(() => {
                whir.channel = socket.whir.channel;
                whir.send(socket, {
                        message: `Welcome to the _:channel:_ channel!`,
                        currentUsers: wss.clients
                            .map(client => socket.whir.user !== client.whir.user ? client.whir.user : null)
                            .filter(user => user)
                    }, wss.clients.length)
                    .broadcast(wss.clients, {
                        message: `_:user:_ has joined the channel!`,
                        action: {
                            method: 'join',
                            user: socket.whir.user
                        }
                    }, socket);
            });
        });
    });

    wss.on('close', socket => {
       console.log('closed', socket);
    });
};
