'use strict';


let url = require('url'),
    querystring = require('querystring');

module.exports = {

    args: args => {

        let query = url.parse(args.url).query;
        return querystring.parse(query);
    }
};
