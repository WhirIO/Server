'use strict';


const parse = attract('library/parse');

module.exports = (router, control) => {

    router.ws('/', parse.headers, control.message);

    return router;
};
