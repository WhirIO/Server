'use strict';


let fs = require('fs'),
    setup = router => {

        let schemaPath = __dirname + '/routes/',
            control = __dirname + '/../mvc/controllers/';

        fs.readdirSync(schemaPath).forEach(file => {
            if (file.match(/(.+)\.js(on)?$/)) {
                fs.stat(control + file, error => {
                    if (!error) {
                        router = require(schemaPath + file)(router, require(control + file));
                    } else {
                        console.error(`I was not able to find a controller for the ${file} route.`);
                    }
                });
            }
        });

        return router;
    };

module.exports = express => setup(express.Router());
