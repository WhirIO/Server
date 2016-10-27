'use strict';


const bcrypt = require('promised-bcrypt');
const m = _require('models');

module.exports = {

    run: (whir, socket, input) => {

        const data = {};
        data.channel = socket.whir.channel;
        input = input.match(/^\/([\w]+)\s?(.*)?/);
        switch (input[1]) {
            case 'help':
                data.message = 'Commands:';
                data.payload = {
                    showTitle: true,
                    items: {
                        '/find': { type: 'string', value: '/find [starts with ...]' },
                        '/desc': { type: 'string', value: '/desc [channel description]' },
                        '/max': { type: 'string', value: '/max [number]' },
                        '/kick': { type: 'string', value: '/kick [username]' },
                        '/ban': { type: 'string', value: '/ban [username]' },
                        '/purge': { type: 'string', value: '/purge [minutes]' },
                        '/private': { type: 'string', value: '/private [password]' },
                        '/public': { type: 'string', value: '' },
                        '/info': { type: 'string', value: '' },
                        '/mute': { type: 'string', value: '' },
                        '/unmute': { type: 'string', value: '' },
                        '/clear': { type: 'string', value: '' },
                        '/exit': { type: 'string', value: '' }
                    }
                };
                whir.send(socket, data);
                break;

            case 'find':
                m.channel.findOne({ name: socket.whir.channel })
                    .lean()
                    .exec()
                    .then(channel => {
                        let users = channel.connectedUsers.filter(item => item.user.indexOf(input[2]) >= 0).sort();
                        data.message = `${users.length} matches:`;
                        data.payload = {
                            showTitle: true,
                            items: {}
                        };

                        const usersToShow = users.length >= 10 ? 10 : users.length;
                        for (let usr = 0; usr < usersToShow; usr++) {
                            data.payload.items[users[usr].user] = { type: 'string', value: '' };
                        }

                        if (users.length > usersToShow) {
                            data.payload.items['...'] = { type: 'string', value: '' };
                        }

                        whir.send(socket, data);
                    });
                break;

            case 'desc':
                m.channel.findOneAndUpdate({
                        name: socket.whir.channel,
                        'meta.owner': socket.whir.session
                    },
                    { description: input[2] })
                    .lean()
                    .exec()
                    .then(channel => {
                        if (!channel) {
                            data.message = 'You can\'t update this channel.';
                            return whir.send(socket, data);
                        }

                        data.message = 'Description updated.';
                        whir.send(socket, data);
                    });
                break;

            case 'max':
                m.channel.findOneAndUpdate({
                        name: socket.whir.channel,
                        'meta.owner': socket.whir.session
                    },
                    { maxUsers: parseInt(input[2], 10) })
                    .lean()
                    .exec()
                    .then(channel => {
                        if (!channel) {
                            data.message = 'You can\'t update this channel.';
                            return whir.send(socket, data);
                        }

                        data.message = 'Max. users updated.';
                        whir.send(socket, data);
                    });
                break;

            case 'private':
                bcrypt.hash(input[2])
                    .then(hash => m.channel.findOneAndUpdate({
                                name: socket.whir.channel,
                                'meta.owner': socket.whir.session
                            },
                            { 'access.public': false, 'access.password': hash })
                            .lean()
                            .exec()
                    )
                    .then(channel => {
                        if (!channel) {
                            data.message = 'You can\'t update this channel.';
                            return whir.send(socket, data);
                        }

                        data.message = 'The channel is now private.';
                        whir.send(socket, data);
                    });
                break;

            case 'public':
                m.channel.findOneAndUpdate({
                        name: socket.whir.channel,
                        'meta.owner': socket.whir.session
                    },
                    { 'access.public': true, 'access.password': null })
                    .lean()
                    .exec()
                    .then(channel => {
                        if (!channel) {
                            data.message = 'You can\'t update this channel.';
                            return whir.send(socket, data);
                        }

                        data.message = 'The channel is now public.';
                        whir.send(socket, data);
                    });
                break;

            case 'info':
                m.channel.findOne({ name: socket.whir.channel })
                    .lean()
                    .exec()
                    .then(channel => {
                        data.message = 'Channel:';
                        data.payload = {
                            showTitle: true,
                            pad: false,
                            items: {
                                'Name:': { type: 'string', value: channel.name },
                                'Description:': { type: 'string', value: channel.description },
                                'Users online:': { type: 'number', value: channel.connectedUsers.length },
                                'Max. users:': { type: 'number', value: channel.maxUsers },
                                'Online since:': { type: 'date', value: channel.meta.createdOn }
                            }
                        };
                        whir.send(socket, data);
                    });
                break;
        }
    }
};
