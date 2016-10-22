'use strict';


const fs = require('fs');

module.exports = express => {

    let router = express.Router();
    fs.readdirSync(`${__dirname}/routes/`).forEach(file => {
        if (file.match(/(.+)\.js$/)) {
            try {
                router = _require(`router/routes/${file}`)(router, _require(`controllers/${file}`));
            } catch (error) {
                console.error(`I was not able to find a controller for the ${file} route.`);
            }
        }
    });

    return router;
};
