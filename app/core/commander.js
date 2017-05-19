
const bcrypt = require('bcrypt');
const m = require('../models');

class Commander {

  async run({ session = null, channel = null }, input) {
    this.data = {};
    this.session = session;
    this.channel = channel;
    const match = input.match(/^\/([\w]+)\s?(.*)?/);

    try {
      const command = match[1];
      this.query = match[2];
      await this[command]();
    } catch (error) {
      this.data.message = error.message;
    }

    return this.data;
  }

  help() {
    this.data.message = 'Available commands:';
    this.data.payload = {
      showTitle: true,
      pad: '+3',
      items: {
        '/find': { type: 'string', value: '/find [starts with ...]' },
        '/desc': { type: 'string', value: '/desc [channel description]' },
        '/max': { type: 'string', value: '/max [number]' },
        '/kick': { type: 'string', value: '/kick [username]' },
        '/ban': { type: 'string', value: '/ban [username]' },
        '/purge': { type: 'string', value: '/purge [minutes]' },
        '/channel': { type: 'string', value: '/channel [public || private] [, password]' },
        '/stats': { type: 'string', value: '' },
        '/mute': { type: 'string', value: '' },
        '/unmute': { type: 'string', value: '' },
        '/clear': { type: 'string', value: '' },
        '/exit': { type: 'string', value: '' }
      }
    };
  }

  async stats() {
    const channel = await m.channel.fetch({ channel: this.channel });
    this.data.message = 'Channel statistics:';
    this.data.payload = {
      showTitle: true,
      pad: '+2',
      items: {
        'Name:': { type: 'string', value: channel.name },
        'Public:': { type: 'string', value: channel.access.public ? 'Yes' : 'No' },
        'Users online:': { type: 'number', value: channel.connectedUsers.length },
        'Users allowed:': { type: 'number', value: channel.maxUsers },
        'Online since:': { type: 'date', value: channel.meta.createdOn },
        'Messages sent:': { type: 'number', value: 4536 },
        'Most active user:': { type: 'string', value: 'James' }
      }
    };

    if (channel.description) {
      this.data.payload.items.Description = {
        type: 'string',
        value: channel.description
      };
    }
  }

  async find() {
    const channel = await m.channel.fetch({
      channel: this.channel
    });

    const users = channel.connectedUsers.filter(item => item.user.indexOf(this.query) >= 0).sort();
    this.data.message = !users.length ? 'No matches found.' : `${users.length} matches:`;
    this.data.payload = {
      showTitle: true,
      items: {}
    };

    const usersToShow = users.length >= 10 ? 10 : users.length;
    for (let user = 0; user < usersToShow; user += 1) {
      this.data.payload.items[users[user].user] = { type: 'string', value: '' };
    }

    if (users.length > usersToShow) {
      this.data.payload.items['...'] = { type: 'string', value: '' };
    }
  }

  async desc() {
    const channel = await m.channel.update({
      channel: this.channel,
      session: this.session
    }, { description: this.query });

    if (!channel) {
      this.data.message = 'You don\'t have permission to update this channel.';
      this.data.alert = true;
    } else {
      this.data.message = 'Description updated.';
    }
  }

  async max() {
    let maxUsers = Math.abs(parseInt(this.query, 10));
    if (!maxUsers) {
      throw new Error('You must provide a valid number.');
    }

    maxUsers = maxUsers < 2 ? 2 : maxUsers;
    maxUsers = maxUsers > 500 ? 500 : maxUsers;
    const channel = await m.channel.update({
      channel: this.channel,
      session: this.session
    }, { maxUsers });

    if (!channel) {
      this.data.message = 'You don\'t have permission to update this channel.';
      this.data.alert = true;
    } else {
      this.data.message = `Max. users set to _${maxUsers}_.`;
    }
  }

  async private() {
    const hash = await bcrypt.hash(this.query);
    const channel = await m.channel.update({
      channel: this.channel,
      session: this.session
    }, { 'access.public': false, 'access.password': hash });

    if (!channel) {
      this.data.message = 'You don\'t have permission to update this channel.';
      this.data.alert = true;
    } else {
      this.data.message = 'The channel is now private.';
    }
  }

  async public() {
    const channel = await m.channel.update({
      channel: this.channel,
      session: this.session
    }, { 'access.public': true, 'access.password': null });

    if (!channel) {
      this.data.message = 'You don\'t have permission to update this channel.';
      this.data.alert = true;
    } else {
      this.data.message = 'The channel is now public.';
    }
  }
}

module.exports = new Commander();
