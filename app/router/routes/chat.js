'use strict';


const parse = _require('library/parse');

module.exports = (router, control) => {

    router.ws('/', parse.headers, control.message);

    return router;
};
