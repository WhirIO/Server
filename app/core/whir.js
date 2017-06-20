const bcrypt = require('bcrypt');
const commander = require('./commander');
const Emitter = require('events').EventEmitter;
const m = require('../models');
const redis = require('redis');
const roli = require('roli');
const WS = require('uws');

const reg = (message, client) => message.replace(/:([\w]+):/g, (match, property) => client.current[property] || match);
const closeSocket = (data, socket) => {
  if (typeof data === 'string') {
    data = { message: data };
  }

  data.channel = socket.current.channel;
  data.message = reg(data.message, socket);
  socket.close(1011, JSON.stringify(data));
  socket.current = null;
  return null;
};
const socketState = async (socket, channel) => {
  if (!socket.current.session) {
    return closeSocket('You need a valid session.', socket);
  }

  const plainPassword = socket.current.password;
  socket.current.password = socket.current.password ? await bcrypt.hash(socket.current.password, 12) : null;
  if (channel.connectedUsers.length === channel.maxUsers) {
    return closeSocket('This channel does not accept more users.', socket);
  }

  if (channel.password) {
    if (!socket.current.password) {
      return closeSocket('This is a private channel; you need a password.', socket);
    }

    const match = await bcrypt.compare(plainPassword, channel.password);
    if (!match) {
      return closeSocket('Your password does not match this channel\'s.', socket);
    }
  }

  if (channel.connectedUsers.find(user => user.user === socket.current.user)) {
    return closeSocket('This username (:user:) is already in use in this channel.', socket);
  }

  return true;
};

class Whir extends Emitter {

  constructor({ port, redisConf }) {
    super();

    this.wss = new WS.Server({ port }, () => {
      this.emit('info', `Whir: Listening on port ${port}`);
    });

    try {
      this.redis = redis.createClient(redisConf.url || redisConf);
      this.redis.prefix = redisConf.prefix;
      this.redis.on('error', (error) => {
        const message = error.origin ? error.origin.message : error.message;
        this.emit('error', `Redis: ${message}`);
      });

      this.redis.on('warning', (error) => {
        this.emit('warning', error);
      });

      commander.redis = this.redis;
      this.serverEvents();
    } catch (error) {
      this.emit('error', `Redis: ${error.message}`);
    }
  }

  serverEvents() {
    this.wss.on('connection', async (socket) => {
      this.socketEvents(socket);
      const channel = await m.channel.connect(socket.current);
      if (!(await socketState(socket, channel))) {
        return null;
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

    this.wss.on('close', (socket) => {
      this.emit('info', `A socket has been closed: ${socket}`);
    });
  }

  socketEvents(socket) {
    socket.current = {
      channel: socket.upgradeReq.headers['x-whir-channel'] || roli({ case: 'lower' }),
      user: socket.upgradeReq.headers['x-whir-user'],
      password: socket.upgradeReq.headers['x-whir-pass'] || null,
      session: socket.upgradeReq.headers['x-whir-session'] || null
    };

    socket.on('message', this.messageHandler.bind(this, socket));
    socket.on('close', async () => {
      if (!socket.current) {
        return;
      }

      await m.channel.removeUser(socket.current);
      this.broadcast({
        user: socket.current.user,
        message: '-I left the channel.-',
        action: 'leave'
      }, socket);
    });
  }

  async messageHandler(socket, data) {
    try {
      const payload = Buffer.from(data).toString('utf8');
      let parsedData = JSON.parse(payload);
      if (parsedData.message.match(/^\/[\w]/)) {
        parsedData = await commander.run(socket.current, parsedData.message);
        return this.send(parsedData, socket);
      }

      return this.broadcast(parsedData, socket);
    } catch (error) {
      return this.emit('error', `Incoming message: ${error.message}`);
    }
  }

  send(data, client) {
    data.channel = client.current.channel;
    if (data.alert) {
      data.message = data.alert;
      data.alert = true;
    }
    data.message = reg(data.message, client);
    client.send(JSON.stringify(data), { binary: true, mask: true }, (error) => {
      if (error) {
        this.emit('error', `Outgoing message: ${error.message}`);
      }
    });
    return this;
  }

  /**
   * Broadcast a message to all connected clients, except the
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
}

module.exports = Whir;
