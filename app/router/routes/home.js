'use strict';


const parse = _require('library/parse');

module.exports = (router, control) => {

    router.get('/', control.home);
    router.ws('/', parse.headers, control.message);

    return router;
};
