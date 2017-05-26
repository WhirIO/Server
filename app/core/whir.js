
class Whir {

  constructor(wss) {
    this.wss = wss;
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
    if (this.wss.clients) {
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
    client.close(1011, JSON.stringify(data));
    client.current = null;
    this.wss = null;
  }
}

module.exports = Whir;
