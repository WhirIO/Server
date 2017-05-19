'use strict';


const whir = _require('library/whir');
const m = _require('models');

module.exports.start = wss => {

    wss.on('connection', async socket => {

        if (!socket.whir.session) {
            return whir.close(socket, 'You need a valid session.');
        }

        const update = {
            $setOnInsert: {
                name: socket.whir.channel
            }
        };

        const channel = await m.channel
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
                })
                .broadcast({
                    message: `_:user:_ has joined the channel!`,
                    action: {
                        method: 'join',
                        user: socket.whir.user
                    }
                }, wss.clients, socket);
        });
    });

    wss.on('close', socket => {
        console.log('closed', socket);
    });
};
