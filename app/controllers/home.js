'use strict';


const m = _require('models');
const whir = _require('library/whir');
const commander = _require('library/commander');

module.exports = {

    home: (req, res) => res.sendStatus(404).end(),

    message: (socket, req) => {

        socket.on('message', data => {

            data = JSON.parse(data.toString('utf8'));
            if (data.message.match(/^\/[\w]/)) {
                const command = commander.run(data.message);
                return command.message ? whir.send(socket, commander.run(data.message)) : null;
            }

            whir.broadcast({
                channel: socket.whir.channel,
                user: data.user,
                message: data.message
            }, req.app.locals.wss.clients, socket);
        });

        socket.on('close', () => {
            if (!socket.whir) {
                return;
            }

            m.channel.findOneAndUpdate({ name: socket.whir.channel }, {
                    $pull: { connectedUsers: { user: socket.whir.user } }
                })
                .exec()
                .then(() => {
                    whir.broadcast({
                        channel: socket.whir.channel,
                        message: '_:user:_ has left the channel!',
                        action: {
                            method: 'leave',
                            user: socket.whir.user
                        }
                    }, req.app.locals.wss.clients, socket);
                });
        });
    }
};
