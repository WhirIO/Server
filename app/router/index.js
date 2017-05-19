
const chat = require('./routes/chat');

module.exports = (express) => {
  let router = express.Router();
  router = chat(router);

  return router;
};
