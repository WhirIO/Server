const commander = require('../core/commander');
const m = require('../models');

module.exports.message = (socket, req) => {
  socket.on('message', async (data) => {
    try {
      let parsedData = JSON.parse(data.toString('utf8'));
      if (parsedData.message.match(/^\/[\w]/)) {
        parsedData = await commander.run(socket.current, parsedData.message);
        return req.app.locals.whir.send(parsedData, socket);
      }

      req.app.locals.whir.broadcast(parsedData, socket);
    } catch (error) {
      console.error(error.message);
    }

    return true;
  });

  socket.on('close', async () => {
    if (!socket.current) {
      return;
    }

    await m.channel.removeUser(socket.current);
    req.app.locals.whir.broadcast({
      user: socket.current.user,
      message: '-I left the channel.-',
      action: 'leave'
    }, socket);
  });
};
