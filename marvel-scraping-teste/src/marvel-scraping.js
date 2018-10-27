var request = require('request');
var rp = require('request-promise');
var Promise = require('bluebird');
var cheerio = require('cheerio');
var crypto = require('crypto');
var settings = require('../config/marvel-settings');

process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';

//1009351

getCharacterById(1009351).then(function (data) {
    var character = data.data.results[0];
    var url = character.urls[0].url;
    // 'https://www.marvel.com/characters/hulk-bruce-banner/in-comics'
    request(url, (error, response, body) => {
        var $ = cheerio.load(body);
        var firstLoading = $('body').children('script')[0].children[0].data.replace(/ *module={[^]* */g, "").replace('__NEXT_DATA__ = ', '').replace(';', '');        
        var teste = $('.masthead__tabs').find('a')[2].attribs.href;
        console.log(firstLoading);
    });
});

function getAuthenticationParams() {
    var ts = new Date().getTime();
    var strHash = ts + settings.PrivateKey + settings.PublicKey;
    var hash = crypto.createHash('md5').update(strHash).digest("hex");
    var auth_params = `apikey=${settings.PublicKey}&ts=${ts}&hash=${hash}`;
    return auth_params;
};

function getCharacterById(id) {
    const url = `https://gateway.marvel.com:443/v1/public/characters/${id}?${getAuthenticationParams()}`;
    return rp(url).then(function (response) {
        return JSON.parse(response);
    })
    .catch(err => console.error(err.stack));



    // return request(url).then(body => {

    //     let results = [];

    //     try {
    //         var data = JSON.parse(body);
    //         results = data.data.results;
    //     } catch (e) {
    //         console.error('Failed to parse json body ' + url)
    //     }
    // })
    // .catch(err => console.error(err.stack));
}



// var options = {
//     url: '',
//     method: 'GET',
//     rejectUnauthorized: false,
//     headers: {
//         'Content-Type': 'text/html; charset=UTF-8',
//         'Content-Language': 'pt-br'
//     }
// }
// request(options, function (error, response, body) {
//     if(error) throw console.log('[ERROR__]: ',error);
//     console.log(body);
// })
