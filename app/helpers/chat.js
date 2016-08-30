'use strict';


module.exports = {

    pack: (channel, message) => {

        message = message.trim();

        let channelLength = Buffer.byteLength(channel),
            messageLength = Buffer.byteLength(message),
            buffer = new Buffer(channelLength + messageLength + 1);

        buffer.writeUInt8(channelLength, 0);
        buffer.write(channel, 1, channelLength);
        buffer.write(message, channelLength + 1, messageLength);

        return buffer;
    },

    unpack: buffer => {

        let channelLength = buffer.readUInt8(0),
            channel = buffer.toString('utf8', 1, channelLength + 1),
            message = buffer.toString('utf8', channelLength + 1);

        return {
            channel: channel,
            message: message
        };
    }
};