'use strict';


const fs = require('fs');

module.exports = express => {

    let router = express.Router();
    fs.readdirSync(`${__dirname}/routes/`).forEach(file => {
        if (file.match(/(.+)\.js$/)) {
            try {
                router = attract(`router/routes/${file}`)(router, attract(`controllers/${file}`));
            } catch (error) {
                console.error(`Can't load controller: ${file}`);
            }
        }
    });

    return router;
};
