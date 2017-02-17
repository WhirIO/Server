'use strict';


const parse = attract('library/parse');

module.exports = (router, control) => {

    router.get('/', control.home);
    router.ws('/', parse.headers, control.message);

    return router;
};
