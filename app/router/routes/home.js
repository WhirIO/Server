'use strict';


let parse = require('../../libraries/parse');

module.exports = (router, control) => {

    router.get('/', control.home);
    router.ws('/', parse.headers, control.message);

    return router;
};
