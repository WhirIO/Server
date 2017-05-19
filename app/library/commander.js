'use strict';


module.exports = {

    run: command => {

        command = command.replace(/^\//g, '');
        const data = {
            message: ''
        };
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
                break;
        }

        return data;
    }
};
