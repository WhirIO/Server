'use strict';


module.exports = (router, control) => {

    router.get('/', control.home);
    router.ws('/', control.message);

    return router;
};
