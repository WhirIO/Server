'use strict';


const m = _require('models');

module.exports = {

    run: (whir, socket, command) => {

        command = command.replace(/^\//g, '');
        const data = {};

        data.channel = socket.whir.channel;
        switch (command) {
            case 'help':
                data.message = 'Available commands:';
                data.payload = {
                    'exit': 'Leave the channel',
                    'users': 'Currently connected users',
                    'find': '/find [starts with ...] - Find a user',
                    'kick': '/kick [username] - Remove a user from the channel',
                    'ban': '/ban [username] - Ban a user from the channel',
                    'purge': '/purge [minutes] - Remove users inactive for more than [minutes]',
                    'private': '/private [password] - Make the channel private',
                    'public': 'Make the channel public',
                    'stats': 'Basic statistics about the channel',
                    'destroy': 'Remove all users and destroy the channel'
                };
                whir.send(socket, data);
                break;

            case 'users':
                m.channel.findOne({ 'name': socket.whir.channel })
                    .exec()
                    .then(channel => {
                        const users = channel.connectedUsers.length;
                        const subject = users === 1 ? 'user' : 'users';
                        const form = users === 1 ? 'is' : 'are';
                        data.message = `There ${form} ${subject} ${users} connected to this channel.`;
                        whir.send(socket, data);
                    });

                break;
        }
    }
};
