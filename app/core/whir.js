const bcrypt = require('bcrypt');
const m = require('../models');
const redis = require('redis');

class Whir {

  constructor(wss) {
    this.wss = wss;
    this.redis = redis.createClient();
    this.redis.on('error', () => {
      this.redis = null;
    });

    this.socketEvents(wss);
    return this;
  }

  socketEvents(wss) {
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
        return this.close('This username (:user:) is already in use in this channel.', socket);
      }

      channel.connectedUsers.push(socket.current);
      await channel.save();
      this.redis.zadd(socket.current.channel, 'NX', 1, 'channelMessages');
      this.send({
        message: 'Welcome to the _:channel:_ channel!',
        currentUsers: channel.connectedUsers
          .map((user) => {
            const current = user.user;
            return current !== socket.current.user ? current : null;
          }).filter(user => user)
      }, socket);

      this.broadcast({ message: '-I joined the channel.-', action: 'join' }, socket);

      return true;
    });

    wss.on('close', (socket) => {
      console.log('Socket closed', socket);
    });
  }

  send(data, client) {
    data.channel = client.current.channel;
    data.message = data.message.replace(/:([\w]+):/g, (match, property) => client.current[property] || match);
    client.send(JSON.stringify(data), { binary: true, mask: true });
    return this;
  }

  /**
   * Broadcast a message to all connected clients, except to the
   * one initiating the request.
   *
   * @param data - The data being broadcast.
   * @param client - The current client.
   */
  broadcast(data, client) {
    if (this.wss && this.wss.clients) {
      if (this.redis) {
        this.redis.zincrby(client.current.channel, 1, 'channelMessages');
        this.redis.zincrby(client.current.channel, 1, client.current.user);
      }

      this.wss.clients.forEach((socket) => {
        if (socket.current.channel === client.current.channel && socket !== client) {
          data.user = client.current.user;
          this.send(data, socket);
        }
      });
    }
  }

  close(data, client) {
    if (typeof data === 'string') {
      data = { message: data };
    }

    data.channel = client.current.channel;
    data.message = data.message.replace(/:([\w]+):/g, (match, property) => client.current[property] || match);
    client.close(1011, JSON.stringify(data));
    client.current = null;
    this.wss = null;
  }
}

module.exports = Whir;
