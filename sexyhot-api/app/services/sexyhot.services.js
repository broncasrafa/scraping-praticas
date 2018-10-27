var request = require('request');
var Promise = require('bluebird');
var settings = require('../../config/appSettings');

module.exports.getData = function(url) {
    return new Promise((resolve, reject) => {
        var options = {
            url: url,
            headers: {
                'User-Agent': settings.USER_AGENT
            }
        };

        request.get(options, (error, response, body) => {
            if(error) {
                return reject(new Error(error.message));
            }
            if(body == null) {
                return reject(new Error('Body is empty'));
            }

            try {
                var json = JSON.parse(body);

                if(!json) {
                    return reject(new Error('No data provided from api'));
                }
                
                return resolve(json);
            } catch(e) {
                return reject(new Error(e.message));
            }
        });
    });
};


