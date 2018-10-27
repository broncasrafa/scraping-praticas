var request = require('request');
var Promise = require('bluebird');
var settings = require('../../config/appSettings');
var cheerio = require('cheerio');
var appScripts = require('../../config/app-scripts');

module.exports.getSearchForPhotos = function(search, page = 0) {
    return new Promise((resolve, reject) => {
        if(!search) {
            return reject(new Error('Argument "search" must be provided'));
        }

        var url = settings.REDTUBE_URL + '/gallery?search=' + search;
        if(page > 0) {
            url = settings.REDTUBE_URL + '/gallery?search=' + search + '&page=' + page;
        }

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

            var $ = cheerio.load(body);
            var objData = {};
            objData.has_next_page = false;
            objData.search_for = '';
            objData.count = '';
            objData.albums = [];
            var contentContainer = $('#content_container');

            //#region Error Page
            var hasErrorContent = contentContainer.find('div.error404Container > h1').text().trim().length > 0;
            if (hasErrorContent) {
                return reject(new Error('Erro 404! Página Não Encontrada'));
            } 
            //#endregion
            
            try {
                //#region Title
                var titleContent = contentContainer.find('div.title_section').children('h1').text().trim();
                var titleCount = appScripts.getTextWithinParenthesis(titleContent);
                var titleSearch = appScripts.getTextWithinDoubleQuotes(titleContent);
                //#endregion

                //#region Albums
                var albums = [];
                var galleryList = contentContainer.find('ul#image_album_list').children('li');
                galleryList.each(function(i, item) {
                    var album_elem = $(this);

                    var objAlbum = {};
                    var id = album_elem.find('div.album_details_wrapper').find('a.album_title').attr('href')
                    objAlbum.id = id.split('/gallery/')[1];
                    objAlbum.title = album_elem.find('div.album_details_wrapper').find('a.album_title').text().trim();
                    objAlbum.views = appScripts.getTotal(album_elem.find('div.album_details_wrapper').find('span.album_views').text().trim());
                    objAlbum.img_count = appScripts.getTotal(album_elem.find('div.album_details_wrapper').find('span.album_img_count').text().trim());
                    objAlbum.vote = album_elem.find('div.gallery_thumb').find('span.album_vote').text().trim();

                    // thumbs
                    var thumbs_elem = album_elem.find('div.gallery_thumb').find('img');
                    objAlbum.thumb = thumbs_elem.attr('data-original');
                    var flipbook = thumbs_elem.attr('data-flipbook').split(' ');
                    var flipbook_list = [];
                    flipbook.forEach(item => {
                        if(item != '') {
                            flipbook_list.push(item);
                        }
                    });
                    objAlbum.flipbook = flipbook_list;
                    
                    albums.push(objAlbum);
                })
                //#endregion

                //#region Paginação
                var pageList = contentContainer.find('ul#w_pagination_list').children('li');
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

                objData.search_for = titleSearch;
                objData.count = titleCount;
                objData.albums = albums;
            } catch(e) {
                return reject(new Error('Error while retrieve data: ' + e.message));
            }

            return resolve(objData);
        });
    });
}

module.exports.getSearchForVideos = function(search, page = 0) {
    return new Promise((resolve, reject) => {
        if(!search) {
            return reject(new Error('Argument "search" must be provided'));
        }

        var url = settings.REDTUBE_URL + '/?search=' + search;
        if(page > 0) {
            url = settings.REDTUBE_URL + '/?search=' + search + '&page=' + page;
        }

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

            var $ = cheerio.load(body);
            var objData = {};
            objData.has_next_page = false;
            objData.search_for = '';
            objData.count = '';
            objData.videos = [];
            objData.related = [];
            var contentContainer = $('#content_container');

            //#region Error Page
            var hasErrorContent = contentContainer.find('div.error404Container > h1').text().trim().length > 0;
            if (hasErrorContent) {
                return reject(new Error('Erro 404! Página Não Encontrada'));
            } 
            //#endregion
            
            try {
                //#region Title
                var titleContent = contentContainer.find('div#title_filter_wrapper').children('h1').text().trim();                
                var titleCount = appScripts.getTextWithinParenthesis(titleContent);
                var titleSearch = contentContainer.find('div#trending_searches').children('span.trending_searches_title').text().trim();
                var titleS = appScripts.getTextWithinDoubleQuotes(titleSearch).toLowerCase()
                var searchFor = appScripts.capitalizeFirstLetter(titleS);
                //#endregion

                //#region Videos
                var videosListObj = [];
                var videosList = contentContainer.find('ul#search_results_block').children('li')
                videosList.each(function(i, item) {
                    var video_elem = $(this);
                    var objVideo = {};
                    objVideo.id = video_elem.find('div.video_title').children('a').attr('href').replace('/', '');
                    objVideo.title = video_elem.find('div.video_title').children('a').text().trim();
                    objVideo.views_count = appScripts.getTotal(video_elem.find('span.video_count').text().trim());
                    objVideo.video_percentage = video_elem.find('span.video_percentage').text().trim()
                    
                    var imgElem = video_elem.find('a.video_link').children('img');
                    objVideo.thumb = imgElem.attr('data-thumb_url');
                    objVideo.data_mediabook = imgElem.attr('data-mediabook');
                    objVideo.isHD = video_elem.find('a.video_link').children('span.duration').find('span.hd-video-text').text().length > 0 ? true : false;
                    
                    objVideo.duration = '';
                    if(objVideo.isHD) {
                        var durationSplit = video_elem.find('a.video_link').children('span.duration').text().trim().split('\n');
                        objVideo.duration = durationSplit[1].trim();
                    } else {
                        var durationSplit = video_elem.find('a.video_link').children('span.duration').text().trim().split('\n');
                        objVideo.duration = durationSplit[0].trim();
                    }

                    videosListObj.push(objVideo);
                })
                //#endregion

                //#region Relacionadas
                var relatedListObj = [];
                var relatedList = contentContainer.find('ul.trending_words').children('li')
                relatedList.each(function(i, item) {
                    var elem = $(this);
                    var objRel = {};
                    objRel.id = elem.find('a').attr('href').split('/?search=')[1]
                    objRel.title = elem.find('a').text().trim()
                    
                    relatedListObj.push(objRel);
                })
                //#endregion

                //#region Paginação
                var pageList = contentContainer.find('ul#w_pagination_list').children('li');
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

                objData.search_for = searchFor;
                objData.count = titleCount;
                objData.videos = videosListObj;
                objData.related = relatedListObj;
            } catch(e) {
                return reject(new Error('Error while retrieve data: ' + e.message));
            }

            return resolve(objData);
        });
    });
}