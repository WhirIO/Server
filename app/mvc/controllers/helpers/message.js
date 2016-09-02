'use strict';


module.exports = {

    pack: data => {

        data.sender = data.sender || '@whir';
        data.username = data.username || '';
        data.message = data.message.trim();
        data.status = data.status || 200;

        let cL = Buffer.byteLength(data.channel),
            sL = Buffer.byteLength(data.sender),
            uL = Buffer.byteLength(data.username),
            mL = Buffer.byteLength(data.message),
            buffer = new Buffer(cL + sL + uL + mL + 6);

        buffer.writeUInt16BE(data.status, 0);
        buffer.writeUInt8(cL, 2);
        buffer.writeUInt8(uL, 3);
        buffer.writeUInt8(sL, 4);
        buffer.write(data.channel, 5, cL);
        buffer.write(data.username, cL + 6, uL);
        buffer.write(data.sender, cL + uL + 6, sL);
        buffer.write(data.message, cL + uL + sL + 6);

        return buffer;
    },

    unpack: buffer => {

        let cL = buffer.readUInt8(2),
            uL = buffer.readUInt8(3),
            sL = buffer.readUInt8(4);

        return {
            status: buffer.readUInt16BE(0),
            channel: buffer.toString('utf8', 5, cL + 5),
            username: buffer.toString('utf8', cL + 6, cL + uL + 6) || null,
            sender: buffer.toString('utf8', cL + uL + 6, sL + cL + uL + 6),
            message: buffer.toString('utf8', cL + uL + sL + 6)
        };
    }
};
