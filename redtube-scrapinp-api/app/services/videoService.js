var request = require('request');
var Promise = require('bluebird');
var settings = require('../../config/appSettings');
var cheerio = require('cheerio');

module.exports.getVideo = function (id) {
    return new Promise((resolve, reject) => {
        if(!id) {
            return reject(new Error('Argument "id" must be provided'));
        }
        
        var options = {
            url: settings.REDTUBE_URL + '/' + id,
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

        // var html = fs.readFileSync('app/examples/video-play/video-idVideo.html');
        // var body = html.toString('utf8');
            var $ = cheerio.load(body);
            var objData = {};
            var contentContainer = $('#content_container');

            //#region Error Page
            var hasErrorContent = contentContainer.find('div.error404Container > h1').text().trim().length > 0;
            if (hasErrorContent) {
                return reject(new Error('Erro 404! Página Não Encontrada'));
            } 
            //#endregion

            try {
                var scriptData = contentContainer.find('div#redtube-player').children('script')[1].children[0].data;
                var parte1 = scriptData.split('});')[1]
                var parte2 = parte1.split('MG_Utils.addEventHandler')[0].replace(/(\r\n\t|\n|\r\t)/gm,"").trim();
                var parte3 = parte2.split('vast:')[0];
                var parte4 = parte3.split('viewUrl:')[0]
                var parte5 = parte4.substring(0, parte4.trim().length - 1).replace('page_params.video_player_setup = ', '')
                var parte6 = parte5.split('playervars:');
                var objJson = JSON.parse(parte6[1]);

                var objVideo = {};
                objVideo.video_duration = objJson.video_duration
                objVideo.image_url = objJson.image_url
                objVideo.video_title = objJson.video_title
                objVideo.defaultQuality = objJson.defaultQuality
                objVideo.mediaDefinitions = objJson.mediaDefinitions
                objVideo.related_url = objJson.related_url
                objData.video = objVideo;
            } catch(e) {
                return reject(new Error('Error while retrieve data: ' + e.message));
            }

            return resolve(objData);
        });
    });
}
