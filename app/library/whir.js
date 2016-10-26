'use strict';


class Whir {

    constructor () {
        this.user = '';
        this.channel = '';
    }

    send (client, data) {

        data.user = data.user || this.user;
        data.channel = data.channel || this.channel;
        data.message = data.message.replace(/:([\w]+):/g, (match, property) => {
            if (property === 'user') {
                return data.action.user || match;
            }

            return client.whir[property] || match;
        });

        client.send(JSON.stringify(data), { binary: true, mask: true });
        return this;
    }

    /**
     * Broadcast a message to all connected clients, except to the
     * one initiating the request, defined by the "currentClient" argument.
     *
     * @param clients - Current WS clients.
     * @param data - The data being broadcast.
     * @param currentClient - The current client, if any.
     */
    broadcast (clients, data, currentClient) {

        const channel = data.channel || this.channel;
        for (let client of clients) {
            if (client.whir.channel === channel && client !== currentClient) {
                this.send(client, data);
            }
        }
    }

    close (client, message) {
        client.whir = null;
        client.close(1011, message);
    }
}

module.exports = new Whir();
