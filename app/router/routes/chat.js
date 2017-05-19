
const roli = require('roli');
const controller = require('../../controllers/chat');

const setHeaders = (socket, req, next) => {
  const headers = socket.upgradeReq.headers;
  socket.current = {
    channel: headers['x-whir-channel'] || roli({ case: 'lower' }),
    user: headers['x-whir-user'],
    password: headers['x-whir-pass'] || null,
    session: headers['x-whir-session'] || null
  };

  next();
};

module.exports = (router) => {
  router.ws('/', setHeaders, controller.message);
  return router;
};
