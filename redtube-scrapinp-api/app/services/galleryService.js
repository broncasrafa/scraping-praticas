var request = require('request');
var Promise = require('bluebird');
var settings = require('../../config/appSettings');
var cheerio = require('cheerio');

var getTotal = function (textoCount) {
    if (textoCount == null) {
        return 0;
    }

    return parseInt(textoCount.match(/\d+/gi).join(''));
}

module.exports.getGallery = function (id, page = 0) {
    return new Promise((resolve, reject) => {
        var url = settings.REDTUBE_URL + '/gallery/' + id;

        if (page > 0) {
            url = settings.REDTUBE_URL  + '/gallery/' + id + '?page=' + page;
        }

        var options = {
            url: url,
            headers: {
                'User-Agent': settings.USER_AGENT
            }
        }

        request.get(options, (error, response, body) => {
            if (error) {
                return reject(new Error(error.message));
            }
            if (body == null) {
                return reject(new Error('Body is empty'));
            }

            var $ = cheerio.load(body);
            var objData = {};

            var contentContainer = $('#content_container');

            var hasErrorContent = contentContainer.find('div.error404Container > h1').text().trim().length > 0;

            if (!hasErrorContent) {
                try {
                    var info = contentContainer.find('div.gallery_info_wrap').find('h1').text().trim();
                    var photos_album_count = info.match(/\(([^)]+)\)/)[1];

                    var photos = contentContainer.find('div.gallery_photo_block').find('ul#image_list_block').children('li')
                    var photosList = [];
                    photos.each(function (i, item) {
                        var photo = $(this);
                        var img_elem = photo.find('a.image_item_url').children('img');
                        var imgSrc = img_elem.attr('data-src');
                        photosList.push(imgSrc);
                    });

                    objData.album_name = info.split(' - All In ')[0].trim();
                    objData.photos_album_count = getTotal(photos_album_count);
                    objData.has_next_page = false;
                    objData.photos = photosList;

                    //#region  Paginação
                    var pageList = contentContainer.find('div.gallery_photo_block').find('ul#w_pagination_list').children('li');
                    pageList.each(function (i, item) {
                        var li_page_elem = $(this);
                        var class_elem = li_page_elem.prop('class');

                        if (i > 0) {
                            if (class_elem.indexOf('w_pagination_next  active') == 0) {
                                objData.has_next_page = true;
                            }
                        }
                    });
                    //#endregion

                } catch (e) {
                    return reject(new Error('Error while retrieve data: ' + e.message));
                }
            } else {
                return reject(new Error('Erro 404! Página Não Encontrada'));
            }

            return resolve(objData);
        });
    })
}
