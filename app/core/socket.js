
const bcrypt = require('bcrypt');
const m = require('../models');
const Whir = require('./whir');

class Socket extends Whir {

  constructor(wss) {
    super(wss);

    wss.on('connection', async (socket) => {
      if (!socket.current.session) {
        return this.close('You need a valid session.', socket);
      }

      const channel = await m.channel.connect(socket.current);
      if (channel.connectedUsers.length === channel.maxUsers) {
        return this.close('This channel does not accept more users.', socket);
      }

      if (!channel.access.public) {
        if (!socket.current.password) {
          return this.close('This is a private channel; you need a password.', socket);
        } else if (!(await bcrypt.compare(socket.current.password, channel.access.password))) {
          return this.close('Your password does not match this channel\'s.', socket);
        }
      }

      if (channel.connectedUsers.find(user => user.user === socket.current.user)) {
        return this.close('This username is already in use in this channel.', socket);
      }

      channel.connectedUsers.push(socket.current);
      await channel.save();
      this.send({
        message: 'Welcome to the _:channel:_ channel!',
        currentUsers: channel.connectedUsers
          .map((user) => {
            const current = user.user;
            return current !== socket.current.user ? current : null;
          }).filter(user => user)
      }, socket);

      this.broadcast({ message: '-joined the channel.-', action: 'join' }, socket);

      return true;
    });

    wss.on('close', (socket) => {
      console.error('Socket closed!', socket);
    });

    return this;
  }
}

module.exports = Socket;
