var request = require('request');
var Promise = require('bluebird');
var settings = require('../../config/appSettings');
var cheerio = require('cheerio');
var appScripts = require('../../config/app-scripts');

module.exports.getContriesCategory = function() {
    return new Promise((resolve, reject) => {
        var options = {
            url: settings.REDTUBE_URL + '/categories?cc=br',
            headers: {
                'User-Agent': settings.USER_AGENT
            }
        }

        request.get(options, (error, response, body) => {
            if(error) {
                return reject(new Error(error.message));
            }
            if(body == null) {
                return reject(new Error('Body is empty'));
            }

            var $ = cheerio.load(body);
            var objData = {};
            objData.country_list = [];
            var contentContainer = $('#content_container');

            //#region Error Page
            var hasErrorContent = contentContainer.find('div.error404Container > h1').text().trim().length > 0;
            if (hasErrorContent) {
                return reject(new Error('Erro 404! Página Não Encontrada'));
            } 
            //#endregion
            
            try {
                var list_elem = contentContainer.find('ul#country_filter_list').children('li');
                list_elem.each(function(i, item) {
                    var li_elem = $(this);
                    var objCountry = {};
                    var href = li_elem.find('a').attr('href');
                    var id = '';
                    if(href.indexOf('cc=') < 0) {
                        id = li_elem.find('a').attr('href').split('/categories/')[1];
                    } else {
                        id = li_elem.find('a').attr('href').split('/categories/popular?cc=')[1];
                    }
                    objCountry.id = id;
                    objCountry.icon_class = li_elem.find('a').children('i').attr('class');
                    objCountry.country = li_elem.find('a').children('span').text().trim();

                    objData.country_list.push(objCountry);
                });
            } catch(e) {
                return reject(new Error('Error while retrieve data: ' + e.message));
            }

            return resolve(objData);
        })
    })
}

module.exports.getCategories = function(country = 'br') {
    return new Promise((resolve, reject) => {
        var url = '';
        if(country == 'world') {
            url = settings.REDTUBE_URL + '/categories/popular';
        } else {
            url = settings.REDTUBE_URL + '/categories?cc=' + country;
        }
        
        var options = {
            url: url,
            headers: {
                'User-Agent': settings.USER_AGENT
            }
        }

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
            objData.country = '';
            objData.top_categories = [];
            objData.categories = [];

            var contentContainer = $('#content_container');

            //#region Error Page
            var hasErrorContent = contentContainer.find('div.error404Container > h1').text().trim().length > 0;
            if (hasErrorContent) {
                return reject(new Error('Erro 404! Página Não Encontrada'));
            } 
            //#endregion

            try {
                var titleContent = contentContainer.find('div.top_popular_category_header').children('h1').text().trim();                
                var country = titleContent.split('in ')[1];

                //#region Top Categories
                var topList = [];
                var topCategoriesList = contentContainer.find('ul#top_popular_categories').children('li');
                topCategoriesList.each(function(i, item) {
                    var item_elem = $(this);
                    var objCat = {};
                    var a_elem = item_elem.find('div.category_item_wrapper').children('a.category_thumb_link')
                    var id = a_elem.attr('href').split('/redtube/')[1];
                    var imgThumb = a_elem.find('img').attr('data-thumb_url');
                    var title = item_elem.find('div.category_item_wrapper').children('div.category_item_info').find('a.category_item_link').text().trim()
                    var category_count = item_elem.find('div.category_item_wrapper').children('div.category_item_info').find('span.category_count').text().trim()
                    
                    objCat.id = id;
                    objCat.title = title;
                    objCat.thumb = imgThumb;
                    objCat.category_count = category_count;                    

                    topList.push(objCat);
                });
                //#endregion

                //#region Categories
                var catList = [];
                var categoriesList = contentContainer.find('ul#categories_list_block').children('li');
                categoriesList.each(function(i, item) {
                    var item_elem = $(this);
                    var objCat = {};
                    var a_elem = item_elem.find('div.category_item_wrapper').children('a.category_thumb_link')
                    var id = a_elem.attr('href').split('/redtube/')[1];
                    var imgThumb = a_elem.find('img').attr('data-thumb_url');
                    var title = item_elem.find('div.category_item_wrapper').children('div.category_item_info').find('a.category_item_link').text().trim()
                    var category_count = item_elem.find('div.category_item_wrapper').children('div.category_item_info').find('span.category_count').text().trim()
                    
                    objCat.id = id;
                    objCat.title = title;
                    objCat.thumb = imgThumb;
                    objCat.category_count = category_count;                    

                    catList.push(objCat);
                });
                //#endregion

                //#region Paginacao
                var paginationContent = contentContainer.children('div#w_pagination');
                var pageList = paginationContent.find('ul').children('li');

                pageList.each(function(i, item) {
                    var li_page_elem = $(this);
                    var class_elem = li_page_elem.prop('class');

                    if(i > 0) {
                        if(class_elem.indexOf('w_pagination_next  active') == 0) {
                            objData.has_next_page = true;
                        }
                    }
                });
                //#endregion
                
                objData.country = country == undefined ? 'Mundo' : country;
                objData.top_categories = topList;
                objData.categories = catList;
            } catch(e) {
                return reject(new Error('Error while retrieve data: ' + e.message));
            }

            return resolve(objData);
        })
    })
}

module.exports.getCategory = function(category, page = 0) {
    return new Promise((resolve, reject) => {
        if(!category) {
            return reject(new Error('Argument "category" must be provided'))
        }

        var url = settings.REDTUBE_URL + '/redtube/' + category;
        
        if(page > 0) {
            url = settings.REDTUBE_URL + '/redtube/' + category + '?page=' + page;
        }

        var options = {
            url: url,
            headers: {
                'User-Agent': settings.USER_AGENT
            }
        }

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
            objData.title = '';
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
                var titleContent = contentContainer.find('div.title_filter').children('h1').text().trim();
                var titleCategory = contentContainer.find('div#trending_searches.browse_categories').children('span.trending_searches_title').text().trim();
                var titleCat = appScripts.getTextWithinDoubleQuotes(titleCategory).toLowerCase()
                //#endregion

                //#region Videos
                var videosListObj = [];
                var videosList = contentContainer.find('ul#block_browse').children('li')
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
                
                objData.title = appScripts.capitalizeFirstLetter(titleCat);
                objData.count = appScripts.getTotal(titleContent);
                objData.videos = videosListObj;
                objData.related = relatedListObj;

            } catch(e) {
                return reject(new Error('Error while retrieve data: ' + e.message));
            }

            return resolve(objData);
        })
    })
}