'use strict';


module.exports = {

    run: (whir, socket, command) => {

        command = command.replace(/^\//g, '');
        const data = {};

        data.channel = socket.whir.channel;
        switch (command) {
            case 'help':
                data.message = 'Available commands:';
                data.payload = {
                    'exit': '',
                    'mute': '',
                    'unmute': '',
                    'max': '/max 50',
                    'find': '/find [starts with ...]',
                    'kick': '/kick [username]',
                    'ban': '/ban [username]',
                    'purge': '/purge [minutes]',
                    'private': '/private [password]',
                    'public': '',
                    'stats': '',
                    'destroy': ''
                };
                whir.send(socket, data);
                break;
        }
    }
};
