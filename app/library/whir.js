'use strict';


class Whir {

    constructor () {
        this.user = 'whir';
        this.color = 'white';
        this.channel = '';
    }

    send (client, data) {
        if (data.close) {
            return client.close(1011, data.message);
        }

        data.user = data.user || this.user;
        data.color = data.color || this.color;
        data.channel = data.channel || this.channel;
        client.send(JSON.stringify(data), { binary: true, mask: true });

        return this;
    }

    broadcast (clients, session, data) {

        const channel = data.channel || this.channel;
        for (let client of clients) {
            if (client.whir.channel === channel && client.whir.session !== session) {
                this.send(client, data);
            }
        }
    }
}

module.exports = new Whir();
