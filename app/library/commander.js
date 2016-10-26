'use strict';


const m = _require('models');

module.exports = {

    run: (whir, socket, command) => {

        const data = {};
        data.channel = socket.whir.channel;
        command = command.match(/^\/([\w]+)\s?(.*)?/);
        switch (command[1]) {
            case 'help':
                data.message = 'Available commands:';
                data.payload = {
                    'desc': '/desc [channel description]',
                    'max': '/max 50',
                    'find': '/find [starts with ...]',
                    'kick': '/kick [username]',
                    'ban': '/ban [username]',
                    'purge': '/purge [minutes]',
                    'private': '/private [password]',
                    'public': '',
                    'info': '',
                    'mute': '',
                    'unmute': '',
                    'exit': ''
                };
                whir.send(socket, data);
                break;

            case 'desc':
                m.channel.findOneAndUpdate({ name: socket.whir.channel }, { description: command[2] }, { new: true })
                    .exec()
                    .then(channel => {
                        data.message = `Updated channel description: _${channel.description}_`;
                        whir.send(socket, data);
                    });
                break;
        }
    }
};
