var request = require('request');
var Promise = require('bluebird');
var settings = require('../../config/appSettings');
var cheerio = require('cheerio');
var http = require('http');
var fs = require('fs');


var getTotal = function(textoCount) {
    if(textoCount == null) {
        return 0;
    }

    return parseInt(textoCount.match(/\d+/gi).join(''));
}

// var html = fs.readFileSync('app/examples/pornstars_list/page-not-found.html');
// var body = html.toString('utf8');
// var $ = cheerio.load(body);

module.exports.getPornStarsList = function(page = 0) {
    return new Promise((resolve, reject) => {
        var url = settings.REDTUBE_URL + '/pornstar';
        
        if(page > 0) {
            url = settings.REDTUBE_URL + '/pornstar?page=' + page;
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

            var contentContainer = $('#content_container');
            
            var hasErrorContent = contentContainer.find('div.error404Container > h1').text().trim().length > 0;

            if (!hasErrorContent) {
                var objData = {};
                objData.has_next_page = false;

                var textoCount = contentContainer.find('h2.title_inactive').text().trim()
                objData.total = getTotal(textoCount);

                var content = contentContainer.children('div#pornstars_list');
                var list = content.find('ul').children('li');

                objData.stars = [];
                list.each(function(i, item) {
                    try {
                        var li_elem = $(this);
                        var objStar = {};
                        
                        var name = li_elem.find('a.ps_info_name').text().trim();
                        var id = li_elem.find('a.ps_info_name').attr('href').split('/')[2];
                        var img = li_elem.find('a.pornstar_link').children('img').attr('src');
                        var dataThumb_url = li_elem.find('a.pornstar_link').children('img').attr('data-thumb_url');
                        var count_videos = li_elem.find('div.ps_info_count').text().trim()
                        var rank = li_elem.find('a.pornstar_link').find('div.ps_info_rank').text().trim();

                        var thumb = '';

                        if(img.indexOf('data:image/gif;base64') < 0) {                        
                            thumb = img;
                        } else {
                            thumb = dataThumb_url;
                        }

                        objStar.id = id;
                        objStar.name = name;
                        objStar.thumb = thumb;
                        objStar.videos_count = getTotal(count_videos);
                        objStar.info_rank = getTotal(rank);
                        objData.stars.push(objStar);
                    } catch(e) {
                        return reject(new Error('Error while retrieve data: ' + e.message));
                    }
                });

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

            } else {
                return reject(new Error('Erro 404! Página Não Encontrada'));
            }

            return resolve(objData);
        });
    });
}

module.exports.getPornStarsDestaqueList = function() {
    return new Promise((resolve, reject) => {
        var url = settings.REDTUBE_URL + '/pornstar';

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

            var contentContainer = $('#content_container');
            
            var hasErrorContent = contentContainer.find('div.error404Container > h1').text().trim().length > 0;

            if (!hasErrorContent) {
                var objData = {};
                objData.has_next_page = false;

                var content = contentContainer.children('div#top_trending_section');
                var list = content.find('ul').children('li');
                objData.total = list.length;

                objData.stars = [];
                list.each(function(i, item) {
                    try {
                        var li_elem = $(this);
                        var objStar = {};
                        
                        var name = li_elem.find('a.ps_info_name').text().trim();
                        var id = li_elem.find('a.ps_info_name').attr('href').split('/')[2];
                        var img = li_elem.find('a.pornstar_link').children('img').attr('src');
                        var dataThumb_url = li_elem.find('a.pornstar_link').children('img').attr('data-thumb_url');
                        var count_videos = li_elem.find('div.ps_info_count').text().trim()
                        var rank = li_elem.find('a.pornstar_link').find('div.ps_info_rank').text().trim();

                        var thumb = '';

                        if(img.indexOf('data:image/gif;base64') < 0) {                        
                            thumb = img;
                        } else {
                            thumb = dataThumb_url;
                        }

                        objStar.id = id;
                        objStar.name = name;
                        objStar.thumb = thumb;
                        objStar.videos_count = getTotal(count_videos);
                        objStar.info_rank = getTotal(rank);
                        objData.stars.push(objStar);
                    } catch(e) {
                        return reject(new Error('Error while retrieve data: ' + e.message));
                    }
                });

            } else {
                return reject(new Error('Erro 404! Página Não Encontrada'));
            }

            return resolve(objData);
        });
    });
}

module.exports.getPornStarsAlphabeticList = function(startsWith, page = 0) {
    return new Promise((resolve, reject) => {
        var url = settings.REDTUBE_URL + '/pornstar/' + startsWith;
        
        if(page > 0) {
            url = settings.REDTUBE_URL + '/pornstar/' + startsWith + '?page=' + page;
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

            var contentContainer = $('#content_container');
            
            var hasErrorContent = contentContainer.find('div.error404Container > h1').text().trim().length > 0;

            if (!hasErrorContent) {
                var objData = {};
                objData.has_next_page = false;

                var textoCount = contentContainer.find('h2.title_inactive').text().trim()
                objData.total = getTotal(textoCount);

                var content = contentContainer.children('div#pornstars_list');
                var list = content.find('ul').children('li');

                objData.stars = [];
                list.each(function(i, item) {
                    try {
                        var li_elem = $(this);
                        var objStar = {};
                        
                        var name = li_elem.find('a.ps_info_name').text().trim();
                        var id = li_elem.find('a.ps_info_name').attr('href').split('/')[2];
                        var img = li_elem.find('a.pornstar_link').children('img').attr('src');
                        var dataThumb_url = li_elem.find('a.pornstar_link').children('img').attr('data-thumb_url');
                        var count_videos = li_elem.find('div.ps_info_count').text().trim()
                        var rank = li_elem.find('a.pornstar_link').find('div.ps_info_rank').text().trim();

                        var thumb = '';

                        if(img.indexOf('data:image/gif;base64') < 0) {                        
                            thumb = img;
                        } else {
                            thumb = dataThumb_url;
                        }

                        objStar.id = id;
                        objStar.name = name;
                        objStar.thumb = thumb;
                        objStar.videos_count = getTotal(count_videos);
                        objStar.info_rank = getTotal(rank);
                        objData.stars.push(objStar);
                    } catch(e) {
                        return reject(new Error('Error while retrieve data: ' + e.message));
                    }
                });

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

            } else {
                return reject(new Error('Erro 404! Página Não Encontrada'));
            }

            return resolve(objData);
        });
    });
}

module.exports.getPornStarByName = function(name) {
    return new Promise((resolve, reject) => {
        var url = settings.REDTUBE_URL + '/pornstar/' + name;

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

            try {
                var contentContainer = $('#content_container');

                // erro
                var hasErrorContent = contentContainer.find('div.error404Container > h1').text().trim().length > 0;

                if (!hasErrorContent) {
                    var videos_info = contentContainer.children('div#title_filter_wrapper').find('h1').text().trim();
                    var videos_count = getTotal(videos_info);
                    
                    //#region Detalhes, Infos
                    var pornstar_info_elem = contentContainer.children('div.pornstar_info_wrapper');
                    var pornstar_info_small_elem = pornstar_info_elem.children('div.pornstar_info_small');
                    var thumb = pornstar_info_small_elem.find('div.pornstar_info_small_thumb').find('img').attr('data-src')
                    var pornstar_name = pornstar_info_small_elem.find('div.pornstar_info_small_thumb').find('span').text().trim();

                    var info_stats = [];
                    var info_stats_subscribe_list = pornstar_info_small_elem.find('div.pornstar_info_small_right').find('div.pornstar_info_small_stats_subscribe').find('ul').children('li');
                    info_stats_subscribe_list.each(function(i, item) {
                        var li_elem = $(this);
                        var objStats = {};
                        var label = li_elem.find('span.pornstar_info_stat_label').text().trim();
                        var data = li_elem.find('span.pornstar_info_stat_data').text().trim();
                        objStats.label = label;
                        objStats.data = data;
                        info_stats.push(objStats);
                    })


                    var pornstar_info_big_elem = pornstar_info_elem.children('div.pornstar_info_big');

                    var details = [];
                    var more_details_list = pornstar_info_big_elem.find('div.pornstar_info_big_left').find('ul.pornstar_more_details').children('li');
                    more_details_list.each(function(i, item) {
                        var li_elem = $(this);
                        var objDetails = {};
                        var label = li_elem.find('span.pornstar_more_details_label').text().trim();
                        var data = li_elem.find('span.pornstar_more_details_data').text().trim();
                        objDetails.label = label;
                        objDetails.data = data;
                        details.push(objDetails);
                    });

                    var bio_details = pornstar_info_big_elem.find('div.pornstar_info_big_right').find('div.pornstar_info_bio').text().replace(/\n/g, '').trim();
                    var biografia = bio_details;
                    //#endregion

                    //#region Videos
                    var videos_list_elem = contentContainer.children('ul#pornstar_profile_block.videos').children('li');
                    var videos_list = [];
                    videos_list_elem.each(function(i, item) {
                        var video_elem = $(this);
                        var objVideo = {};

                        var video_anchor = video_elem.find('a');
                        
                        objVideo.video_title = video_anchor.children('div.video_title').prop('title'); 
                        objVideo.video_count = video_elem.find('span.video_count').text().trim();
                        objVideo.video_percentage = video_elem.find('span.video_percentage').text().trim();
                        objVideo.isHD = video_anchor.find('span.hd-video-text').text().length > 0 ? true : false;
                        
                        if(video_anchor.find('span.hd-video-text').text().length > 0) {
                            var durationSplit = video_anchor.find('span.duration').text().trim().split('\n');
                            objVideo.duration = durationSplit[1].trim();
                        } else {
                            var durationSplit = video_anchor.find('span.duration').text().trim().split('\n');
                            objVideo.duration = durationSplit[0].trim();
                        }
                        var img = video_anchor.children('span.video_thumb_wrap').find('img');
                        objVideo.thumb = img.attr('data-thumb_url');
                        
                        var imgObj = {};
                        imgObj.data_thumb_url = img.attr('data-thumb_url');
                        imgObj.data_mediumthumb = img.attr('data-mediumthumb');
                        imgObj.data_mediabook = img.attr('data-mediabook');

                        objVideo.data = imgObj;
                        videos_list.push(objVideo);
                    });
                    //#endregion                    
                    objData.name = pornstar_name;
                    objData.id = name;
                    objData.thumb = thumb;
                    objData.videos_count = videos_count;
                    objData.biografia = biografia == '' ? null : biografia;
                    objData.info_stats_subscribe = [];
                    objData.more_details = [];
                    objData.videos = [];
                    objData.info_stats_subscribe = info_stats
                    objData.more_details = details;
                    objData.videos = videos_list;
                    
                } else {
                    return reject(new Error('Erro 404! Página Não Encontrada'));
                }

            } catch(e) {
                return reject(new Error('Error while retrieve data: ' + e.message));
            }

            return resolve(objData);
        });

        
        
    })
}

module.exports.getPornStarGalleries = function(name, page = 0) {
    return new Promise((resolve, reject) => {
        var url = settings.REDTUBE_URL + '/pornstar/' + name + '/gallery';

        if(page > 0) {
            url = settings.REDTUBE_URL + '/pornstar/' + name + '/gallery' + '?page=' + page;
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

            try {
                var contentContainer = $('#content_container');

                // erro
                var hasErrorContent = contentContainer.find('div.error404Container > h1').text().trim().length > 0;

                if (!hasErrorContent) {
                    var galleries_list = contentContainer.find('ul#image_album_list').children('li');
                    
                    var albums_count = contentContainer.find('ul#image_album_list').children('li').length;
                    
                    var albums = [];
                    galleries_list.each(function(i, item) {
                        var album_elem = $(this);
                        
                        var objAlbum = {};
                        var id = album_elem.find('div.album_details_wrapper').find('a.album_title').attr('href')
                        objAlbum.id = id.split('/gallery/')[1];
                        objAlbum.title = album_elem.find('div.album_details_wrapper').find('a.album_title').text().trim();
                        objAlbum.views = getTotal(album_elem.find('div.album_details_wrapper').find('span.album_views').text().trim());
                        objAlbum.img_count = getTotal(album_elem.find('div.album_details_wrapper').find('span.album_img_count').text().trim());
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
                    });

                    objData.id = name;
                    objData.albums_count = albums_count 
                    objData.has_next_page = false;
                    objData.albums = [];
                    objData.albums = albums;

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
                    
                } else {
                    return reject(new Error('Erro 404! Página Não Encontrada'));
                }

            } catch(e) {
                return reject(new Error('Error while retrieve data: ' + e.message));
            }

            return resolve(objData);
        });
        
    });
}

module.exports.getPornStarVideos = function(name, page = 0) {
    return new Promise((resolve, reject) => {
        var url = settings.REDTUBE_URL + '/pornstar/' + name;

        if(page > 0) {
            url = settings.REDTUBE_URL + '/pornstar/' + name + '?page=' + page;
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

            try {
                var contentContainer = $('#content_container');

                // erro
                var hasErrorContent = contentContainer.find('div.error404Container > h1').text().trim().length > 0;

                if (!hasErrorContent) {
                    var videos_info = contentContainer.children('div#title_filter_wrapper').find('h1').text().trim();
                    var videos_count = getTotal(videos_info);
                    
                    var pornstar_info_elem = contentContainer.children('div.pornstar_info_wrapper');
                    var pornstar_info_small_elem = pornstar_info_elem.children('div.pornstar_info_small');

                    var pornstar_thumb = pornstar_info_small_elem.find('div.pornstar_info_small_thumb').find('img').attr('data-src')
                    var pornstar_name = pornstar_info_small_elem.find('div.pornstar_info_small_thumb').find('span').text().trim();

                    // videos
                    var videos_list_elem = contentContainer.children('ul#pornstar_profile_block.videos').children('li');
                    var videos_list = [];
                    videos_list_elem.each(function(i, item) {
                        var video_elem = $(this);
                        var objVideo = {};

                        var video_anchor = video_elem.find('a');
                        
                        objVideo.video_title = video_anchor.children('div.video_title').prop('title'); 
                        objVideo.video_count = video_elem.find('span.video_count').text().trim();
                        objVideo.video_percentage = video_elem.find('span.video_percentage').text().trim();
                        objVideo.isHD = video_anchor.find('span.hd-video-text').text().length > 0 ? true : false;
                        
                        if(video_anchor.find('span.hd-video-text').text().length > 0) {
                            var durationSplit = video_anchor.find('span.duration').text().trim().split('\n');
                            objVideo.duration = durationSplit[1].trim();
                        } else {
                            var durationSplit = video_anchor.find('span.duration').text().trim().split('\n');
                            objVideo.duration = durationSplit[0].trim();
                        }
                        var img = video_anchor.children('span.video_thumb_wrap').find('img');
                        objVideo.thumb = img.attr('data-thumb_url');
                        
                        var imgObj = {};
                        imgObj.data_thumb_url = img.attr('data-thumb_url');
                        imgObj.data_mediumthumb = img.attr('data-mediumthumb');
                        imgObj.data_mediabook = img.attr('data-mediabook');

                        objVideo.data = imgObj;
                        videos_list.push(objVideo);
                    });

                    objData.name = pornstar_name;
                    objData.id = name;
                    objData.thumb = pornstar_thumb;
                    objData.videos_count = videos_count;
                    objData.videos = [];
                    objData.videos = videos_list;

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
                } else {
                    return reject(new Error('Erro 404! Página Não Encontrada'));
                }
                
            } catch(e) {
                return reject(new Error('Error while retrieve data: ' + e.message));
            }

            return resolve(objData);
        });
        
    });
}


/*
//#region Gallery
        var url_gallery = settings.REDTUBE_URL + '/pornstar/' + name + '/gallery';
        var optGallery = {
            url: url_gallery,
            headers: {
                'User-Agent': settings.USER_AGENT
            }
        }

        var albums = [];
        var albums_count = 0;

        objData.albums = [];
        request.get(optGallery, (error, response, body) => {
            if(error) {
                return reject(new Error(error.message));
            }
            if(body == null) {
                return reject(new Error('Body is empty'));
            }

            var $ = cheerio.load(body);
            
            try {
                var contentContainer2 = $('#content_container');
                // erro
                var hasErrorContent2 = contentContainer2.find('div.error404Container > h1').text().trim().length > 0;

                if (!hasErrorContent2) {
                    var galleries_list = contentContainer2.find('ul#image_album_list').children('li');                    
                    albums_count = contentContainer2.find('ul#image_album_list').children('li').length;

                    galleries_list.each(function(i, item) {
                        var album_elem = $(this);
                        
                        var objAlbum = {};
                        objAlbum.id = album_elem.find('div.album_details_wrapper').find('a.album_title').attr('href');
                        objAlbum.title = album_elem.find('div.album_details_wrapper').find('a.album_title').text().trim();
                        objAlbum.views = getTotal(album_elem.find('div.album_details_wrapper').find('span.album_views').text().trim());
                        objAlbum.img_count = getTotal(album_elem.find('div.album_details_wrapper').find('span.album_img_count').text().trim());
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
                    });

                    objData.albums_count = albums_count;
                    objData.albums = albums;

                } else {
                    return reject(new Error('Erro 404! Página Não Encontrada'));
                }
            } catch(e) {
                return reject(new Error('Error while retrieve data: ' + e.message));
            }

            return resolve(objData);
        })
        //#endregion
*/