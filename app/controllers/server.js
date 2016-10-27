'use strict';


const co = require('co');
const whir = _require('library/whir');
const m = _require('models');

module.exports.start = wss => {

    wss.on('connection', socket => {

        if (!socket.whir.session) {
            return whir.close(socket, 'You need a valid session.');
        }

        const update = { $setOnInsert: {
            name: socket.whir.channel,
            'meta.owner': socket.whir.session
        }};

        co(function* () {

            const channel = yield m.channel
                .findOneAndUpdate({ name: socket.whir.channel }, update, { upsert: true, new: true })
                .exec();

            if (!channel.access.public) {
                //return whir.close(socket, 'This is a private channel; you need a password.');
            }

            const userExists = channel.connectedUsers.find(user => user.user === socket.whir.user);
            if (userExists) {
                return whir.close(socket, 'This user(name) is already connected to this channel.');
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
