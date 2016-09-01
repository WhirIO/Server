'use strict';


module.exports = {

    pack: (sender, channel, message) => {

        message = message.trim();

        let cL = Buffer.byteLength(channel),
            sL = Buffer.byteLength(sender),
            mL = Buffer.byteLength(message),
            buffer = new Buffer(cL + sL + mL + 2);

        buffer.writeUInt8(cL, 0);
        buffer.write(channel, 1);
        buffer.writeUInt8(sL, cL + 1);
        buffer.write(sender, cL + 2, sL);
        buffer.write(message, cL + sL + 2);

        return buffer;
    },

    unpack: buffer => {

        let cL = buffer.readUInt8(0),
            channel = buffer.toString('utf8', 1, cL + 1),
            sL = buffer.readUInt8(cL + 1),
            sender = buffer.toString('utf8', cL + 2, cL + sL + 2),
            message = buffer.toString('utf8', cL + sL + 2);

        return {
            sender: sender,
            channel: channel,
            message: message
        };
    }
};