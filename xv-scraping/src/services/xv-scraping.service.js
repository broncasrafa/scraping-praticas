var request = require('request');
var Promise = require('bluebird');
var cheerio = require('cheerio');
var settings = require('../config/appConfig');
var fs = require('fs');
require('./stringops');


//#region Search
module.exports.getSearch = function(k, page = 0) {
    return new Promise(function(resolve, reject) {
        if(!k) {
            return reject(new Error('Argument "k" must be specified'));
        }

        var url = settings.XV_BASE_URL + '/?k=' + encodeParameter(k)
        if(page > 0) {
            url = `${url}&p=${page}`
        }
        
        var options = {
            url: url,
            method: 'GET'
        };
        console.log(url)

        request(options, function(err, response, body) {
            if(err) {
                reject(new Error('Error while retrieve data page'));
            }

            if(body == null) {
                return reject(new Error('Body is empty'));
            }

            var $ = cheerio.load(body);

            var objData = {};
            objData.relatedSearches = [];
            objData.has_next_page = false;
            objData.content = [];

            //#region Paginação
            var has_pagination = $('#content').find('div.pagination').length > 0
            if(has_pagination) {
                $('#content').find('div.pagination').children('ul').find('li').each(function(i, item) {
                    var elem = $(this)
                    var classname = elem.find('a').attr('class')
                    if(classname != undefined) {
                        if(classname.includes('next-page')) { 
                            has_next_page = true
                            objData.has_next_page = true
                        }
                    }
                })
            }
            //#endregion            
            
            //#region Title
            var titleResult = $('.page-title').text().trim();
            titleResult = titleResult.replace(/(\r\n\t|\n|\r\t)/gm,"");
            var titleResultSplit = titleResult.split('(');
            objData.name = titleResultSplit[0];
            objData.total_count = titleResultSplit[1].replace(')', '');
            //#endregion
            
            //#region Related searches
            $('#search-associates').find('span').each(function(i, item) {
                var elem = $(this)
                var classname = elem.attr('class')
                if(!(classname.includes('show-more'))) {
                    var label = elem.find('a').text()
                    var href = elem.find('a').attr('href')
                    var split_1 = href.split('/?k=')[1]
                    var id = split_1.split('&')[0]

                    objData.relatedSearches.push({ label: label, id: id})
                }
            })
            //#endregion
            
            //#region Conteudo
            var contentResult = $('#content .mozaique').children('div');
            contentResult.each(function(i, item) {
                var el = $(this);

                var obj = {};
                obj.profile = {};
                obj.video = {};

                var id = el.prop('id');
                obj.id = id;

                if(id.indexOf("video") == 0) {
                    obj.type = "video";

                    var imgEl = el.find('div.thumb-inside');
                    imgEl.filter(function() {
                        var thumb = $(this).find('div.thumb > a');
                        var anchor_element = thumb;
                        var img = anchor_element.find('img');
                        var href = anchor_element.attr('href');
                        obj.video.id = img.attr('data-videoid');
                        obj.video.thumb = img.attr('data-src');
                        
                        obj.video.link = href;
                        obj.video.url_video_id = href.split('/')[1]
                        obj.video.url_video_title = href.split('/')[2]

                        // gerar o link do preview do video
                        var url = img.attr('data-src')
                        var split_jpg = url.split('.jpg')[0]
                        var split_url = split_jpg.split('.')
                        var val_1 = split_url[2].split('/')[3]
                        var val_2 = split_url[2].split('/')[4]
                        var val_3 = split_url[2].split('/')[5]
                        var val_4 = split_url[2].split('/')[6]
                        var arr = [ val_1, val_2, val_3, val_4 ]
                        var str = arr.join('/')
                        var link_preview = `https://img-egc.xvideos-cdn.com/videos/videopreview/${str}_169.mp4`                        
                        obj.video.link_preview = link_preview

                        var has_hd = $(this).find('span.video-hd-mark');
                        obj.video.is_hd = has_hd.text() ? true : false;
                    });

                    var pTitleEl = el.find('p > a');
                    pTitleEl.filter(function() {
                        var anchor_element = $(this);
                        obj.video.title = anchor_element.attr('title');
                    });

                    var pVideoInfoEl = el.find('p > span.bg');
                    pVideoInfoEl.filter(function() {
                        var spanEl = $(this);
                        var duration = spanEl.find('span.duration').text();
                        obj.video.duration = duration;
                        
                        var viewSplit = spanEl.find('span').text().split('-');
                        if(viewSplit[1] != undefined) {
                            var visualizacoes = viewSplit[1].trim().replace('Visualizações', '').replace('Visualização', '');
                            obj.video.views = visualizacoes.trim();
                        } else {
                            obj.video.views = '0';
                        }

                        var uploadedBy = spanEl.find('a').text();
                        var uploadedByLink = spanEl.find('a').attr('href');
                        obj.video.uploaded_by = null;
                        obj.video.uploaded_by_link = null;

                        if(uploadedBy != '') {
                            obj.video.uploaded_by = uploadedBy;
                        }
                        if(uploadedByLink != undefined) {
                            obj.video.uploaded_by_link = uploadedByLink;
                        }
                    });

                } 
                else if(id.indexOf("profile") == 0) {
                    obj.type = "profile";

                    var profileNameEl = el.find('p').find('a');
                    profileNameEl.filter(function() {
                        var anchor_element = $(this);
                        var text = anchor_element.text();
                        var href = anchor_element.attr('href');
                        obj.profile.name = text;
                        obj.profile.link = href;
                    });                    

                    var profileInfoEl = el.find('p.profile-info');
                    // profileInfoEl.filter(function() {
                    //     var text = $(this).text().replace(/\n/g, '');//.replace(/ /g,'')
                    //     console.log(text)
                    //     var textsplit = text.split('Channel');
                    //     var info = textsplit[1].trim();
                    //     obj.profile.info = info;
                    // });

                    var imgEl = el.find('div.thumb-inside > div.thumb > a');
                    imgEl.filter(function() {
                        var anchor_element = $(this);
                        var href = anchor_element.attr('href');
                        obj.profile.channels_link = href;
                        
                        var children = anchor_element.children('script')[0].children[0].data;
                        var csplit = children.split('document.write(xv.thumbs.replaceThumbUrl(');
                        var imgTagSplit = csplit[1].replace('/>\'));\'', '/>\'').replace('\'));', '');
                        var imgTag = imgTagSplit.trim().replace(/\n/g, '').trim();
                        var regex = /\ssrc=(?:(?:'([^']*)')|(?:"([^"]*)")|([^\s]*))/i;
                        var resMatch = imgTag.replace('                                        ));', '').match(regex);
                        var imgSrc = resMatch[1]||resMatch[2]||resMatch[3];
                        obj.profile.channels_thumb = imgSrc;                        

                        var dvre = /\sdata-videos=(?:(?:'([^']*)')|(?:"([^"]*)")|([^\s]*))/i;
                        var res = imgTag.match(dvre);
                        var str = res[3].replace("\\", "");
                        //var str1 = str.replace('[{"', '{[{"').replace('"}]\\', '"}]}');
                        var str1 = str.replace('[{"', '{"').replace('"}]\\', '"}');
                        //var str1 = str.replace('}]\\', '}]');
                        //var jsonStr = JSON.stringify(str1).replace('\'', '').replace('}]}\'', '}]}');
                        
                        //var data_videos = $.parseJSON(jsonStr);
                        //obj.profile.channels_data_videos = data_videos;

                        // res.forEach(ele => {
                        //     if(ele != undefined) {
                        //         var te = ele.replace("\\", "");
                        //         var hj = te.replace("\/", "/").replace("\/\/", "//");
                        //         console.log(hj);
                        //     }
                        // })
                        //console.log(res[3]);
                        

                        // var div = document.createElement('div');
                        // div.innerHTML = imgTag;
                        // var firstImage = div.getElementsByTagName('img')[0];                        
                        // var rawImgSrc = firstImage ? firstImage.getAttribute("data-videos") : "";
                        // console.log(rawImgSrc);
                        //                                        ));
                    });
                }
//                 var text = filho.innerHTML.match(/<script.*?>([\s\S]*?)<\/script>/gmi);
                objData.content.push(obj);
            });
            //#endregion              

            return resolve(objData);
        });
    });
}
module.exports.getSearchSuggest = function(criteria) {
    return new Promise(function(resolve, reject) {
        if(!criteria) {
            return reject(new Error('Argument "criteria" must be specified'));
        }
        
        var url = settings.XV_BASE_URL + '/search-suggest/' + encodeURI(criteria)
        console.log(url)
        var options = {
            url: url,
            method: 'GET'
        };

        request(options, function(err, response, body) {
            if(err) {
                console.log('ERR: ', err);
                reject(new Error('Error while retrieve data page'));
            }

            if(body == null) {
                return reject(new Error('Body is empty'));
            }

            var json = JSON.parse(body);
            
            if(json) {
                var objData = {};
                objData.keywords = [];
                objData.pornstar = [];
                objData.channel = [];

                if(json.KEYWORDS) {
                    json.KEYWORDS.forEach(item => {
                        var obj = {};
                        obj.name = item.N;
                        obj.count = item.R;
                        objData.keywords.push(obj);
                    });
                }

                if(json.PORNSTAR) {
                    json.PORNSTAR.forEach(item => {
                        var obj = {};
                        obj.name = item.N;
                        obj.type = item.T.toLowerCase();
                        obj.url = settings.XV_BASE_URL + '/k='+ encodeParameter(item.N).toLowerCase()+ '&top';
                        obj.img = item.P.replace('\/','');
                        objData.pornstar.push(obj);
                    });
                }

                if(json.CHANNEL) {
                    json.CHANNEL.forEach(item => {
                        var obj = {};
                        obj.name = item.N;
                        obj.type = item.T.toLowerCase();
                        obj.img = item.P.replace('\/', '');
                        objData.channel.push(obj);
                    });
                }

                return resolve(objData);

            } else {
                return reject(new Error('Error scraping page'));
            }
        });
    });
}
//#endregion

//#region Pornstars
module.exports.getPornstars = function(url) {
    return new Promise((resolve, reject) => {
        var options = {
            url: url,
            method: 'GET'
        };
        request.get(options, (error, response, body) => {
            try {
                var objData = scrapePornstarsList(error, body);
                return resolve(objData);
            } catch(e) {
                return reject(new Error(e.message));
            }
        })
    })
}
module.exports.getPornstar = function(name) {
    return new Promise(function(resolve, reject) {
        if(!name) {
            return reject(new Error('Argument "name" must be specified'));
        }

        var options = {
            url: settings.XV_BASE_URL + '/pornstars/' + name,
            method: 'GET'
        };

        request(options, function(err, response, body) {
            if(err) {
                reject(new Error('Error while retrieve data page'));
            }

            if(body == null) {
                return reject(new Error('Body is empty'));
            }

            var $ = cheerio.load(body);

            return resolve(objData);
        });
    });
}
// ????
module.exports.getPornstarChannels = function(name) {
    return new Promise(function(resolve, reject) {
        if(!name) {
            return reject(new Error('Argument "name" must be specified'));
        }

        var options = {
            url: settings.XV_BASE_URL + '/pornstar-channels/' + name,
            method: 'GET'
        };

        request(options, function(err, response, body) {
            if(err) {
                reject(new Error('Error while retrieve data page'));
            }

            if(body == null) {
                return reject(new Error('Body is empty'));
            }

            var $ = cheerio.load(body);

            fs.writeFileSync('channels.html', body.toString('utf8'), {})

            return resolve(body);
        });
    });
}

function scrapePornstarsList(error, body) {
    if(error) {
        throw new Error(error.message);
    }
    if(body == null) {
        throw new Error('Body is empty');
    }

    try {
        var $ = cheerio.load(body);

        //#region Content
        var profiles = [];
        var contentHtml = $('.mozaique').children('div');
        contentHtml.each(function(i, item) {
            try {
                var div_elem = $(this);
                var id = div_elem.prop('id');
                var profile = {};
                
                profile.id = id;

                // profile name
                var div_p_n_elem = div_elem.find('p.profile-name > a');
                var p_n_href = div_p_n_elem.attr('href');            
                profile.name = div_p_n_elem.text();
                profile.href = p_n_href;

                // thumbs 01
                var div_thumbIns_elem = div_elem.find('div.thumb-inside');
                var country = div_thumbIns_elem.find('span.flag').attr('title');
                var iconClass = div_thumbIns_elem.find('span.flag').attr('class');
                profile.country = country;
                profile.icon_class = iconClass;

                // profile counts
                var div_p_c_elem = div_elem.find('p.profile-counts > span.with-sub');
                profile.count_videos = div_p_c_elem.text().replace(/\n/g, '').trim();

                // thumbs 02
                var thumb_elem = div_thumbIns_elem.find('.thumb');
                var anchor_elem = thumb_elem.find('a');
                profile.channels_link = anchor_elem.attr('href');

                var img_elem = anchor_elem.children('script')[0]
                                        .children[0].data
                                        .replace(/\n/g, '').trim()
                                        .split('document.write(xv.thumbs.replaceThumbUrl(\'')[1].trim()
                                        .replace('  />\'));', ' />');
                anchor_elem.append(img_elem);
                
                var img = anchor_elem.find('img').attr('src');
                profile.thumb = img;

                var lista_data_videos = [];
                var dataVideos = anchor_elem.find('img').attr('data-videos');
                lista_data_videos.push(dataVideos);

                profile.data_videos = [];
                lista_data_videos.forEach(function(item, i) {
                    var it = item.replace('\\\'[', '[')
                                .replace(']\\\'', ']');
                    var jsonObj = JSON.parse(it);
                    jsonObj.forEach(element => {
                        profile.data_videos.push(element);
                    });
                });

                profiles.push(profile);
                
            } catch(e) {
                throw e;
            }
        });
        //#endregion

        //#region Paginação
        var objPage = {}
        objPage.has_next_page = false;
        var hasPagination = $('div.pagination').children('ul').length > 0;
        var hasNextPage = $('div.pagination').children('ul').find('li').find('a.no-page.next-page').length > 0;
        if(hasPagination) {
            objPage.has_next_page = true;
        }
        //#endregion

        var objData = {};                                    
        objData.page_info = objPage;
        objData.profiles = profiles;
        
        return objData;
    } catch(e) {
        throw new Error(e.message);
    }
}
//#endregion

//#region Actresses
module.exports.getPornActresses = function(url) {
    return new Promise((resolve, reject) => {
        var options = {
            url: url,
            method: 'GET'
        };
        console.log(url)
        
        request.get(options, (error, response, body) => {
            try {
                var objData = scrapePornActressesList(error, body);
                return resolve(objData);
            } catch(e) {
                return reject(new Error(e.message));
            }
        })
    })
}
function scrapePornActressesList(error, body) {
    if(error) {
        throw new Error(error.message);
    }
    if(body == null) {
        throw new Error('Body is empty');
    }

    try {

        var $ = cheerio.load(body);
        
        //#region Content
        var profiles = [];
        var contentHtml = $('.mozaique').children('div');
        contentHtml.each(function(i, item) {
            var div_elem = $(this);
            var id = div_elem.prop('id');
            var profile = {};
            
            profile.id = id;

            // profile name
            var div_p_n_elem = div_elem.find('p.profile-name > a');
            var p_n_href = div_p_n_elem.attr('href');            
            profile.name = div_p_n_elem.text();
            profile.href = p_n_href;

            // thumbs 01
            var div_thumbIns_elem = div_elem.find('div.thumb-inside');
            var country = div_thumbIns_elem.find('span.flag').attr('title');
            var iconClass = div_thumbIns_elem.find('span.flag').attr('class');
            profile.country = country;
            profile.icon_class = iconClass;

            // profile counts
            var div_p_c_elem = div_elem.find('p.profile-counts > span.with-sub');
            profile.count_videos = div_p_c_elem.text().replace(/\n/g, '').trim();

            // thumbs 02
            var thumb_elem = div_thumbIns_elem.find('.thumb');
            var anchor_elem = thumb_elem.find('a');
            profile.channels_link = anchor_elem.attr('href');

            var img_elem = anchor_elem.children('script')[0]
                                    .children[0].data
                                    .replace(/\n/g, '').trim()
                                    .split('document.write(xv.thumbs.replaceThumbUrl(\'')[1].trim()
                                    .replace('  />\'));', ' />');
            anchor_elem.append(img_elem);
            
            var img = anchor_elem.find('img').attr('src');
            profile.thumb = img;

            var lista_data_videos = [];
            var dataVideos = anchor_elem.find('img').attr('data-videos');
            lista_data_videos.push(dataVideos);

            profile.data_videos = [];
            lista_data_videos.forEach(function(item, i) {
                var it = item.replace('\\\'[', '[')
                            .replace(']\\\'', ']');
                var jsonObj = JSON.parse(it);
                jsonObj.forEach(element => {
                    profile.data_videos.push(element);
                });
            });

            profiles.push(profile);        
        });
        //#endregion

        //#region Paginação
        var objPage = {}
        objPage.has_next_page = false;
        var hasPagination = $('div.pagination').children('ul').length > 0;
        var hasNextPage = $('div.pagination').children('ul').find('li').find('a.no-page.next-page').length > 0;
        if(hasPagination) {
            objPage.has_next_page = true;
        }
        //#endregion

        var objData = {};                                    
        objData.page_info = objPage;
        objData.profiles = profiles;
        
        return objData;
    } catch(e) {
        throw new Error(e.message);
    }
}
//#endregion

//#region Erotic Models
module.exports.getEroticModels = function(url) {
    return new Promise((resolve, reject) => {
        var options = {
            url: url,
            method: 'GET'
        };
        request.get(options, (error, response, body) => {
            try {
                var objData = scrapeEroticModelsList(error, body);
                return resolve(objData);
            } catch(e) {
                return reject(new Error(e.message));
            }
        })
    })
}

function scrapeEroticModelsList(error, body) {
    if(error) {
        throw new Error(error.message);
    }
    if(body == null) {
        throw new Error('Body is empty');
    }

    try {
        var $ = cheerio.load(body);

        //#region Content
        var profiles = [];
        var contentHtml = $('.mozaique').children('div');
        contentHtml.each(function(i, item) {
            try {
                var div_elem = $(this);
                var id = div_elem.prop('id');
                var profile = {};
                
                profile.id = id;

                // profile name
                var div_p_n_elem = div_elem.find('p.profile-name > a');
                var p_n_href = div_p_n_elem.attr('href');            
                profile.name = div_p_n_elem.text();
                profile.href = p_n_href;

                // thumbs 01
                var div_thumbIns_elem = div_elem.find('div.thumb-inside');
                var country = div_thumbIns_elem.find('span.flag').attr('title');
                var iconClass = div_thumbIns_elem.find('span.flag').attr('class');
                profile.country = country;
                profile.icon_class = iconClass;

                // profile counts
                var div_p_c_elem = div_elem.find('p.profile-counts > span.with-sub');
                profile.count_videos = div_p_c_elem.text().replace(/\n/g, '').trim();

                // thumbs 02
                var thumb_elem = div_thumbIns_elem.find('.thumb');
                var anchor_elem = thumb_elem.find('a');
                profile.channels_link = anchor_elem.attr('href');

                var img_elem = anchor_elem.children('script')[0]
                                        .children[0].data
                                        .replace(/\n/g, '').trim()
                                        .split('document.write(xv.thumbs.replaceThumbUrl(\'')[1].trim()
                                        .replace('  />\'));', ' />');
                anchor_elem.append(img_elem);
                
                var img = anchor_elem.find('img').attr('src');
                profile.thumb = img;

                var lista_data_videos = [];
                var dataVideos = anchor_elem.find('img').attr('data-videos');
                lista_data_videos.push(dataVideos);

                profile.data_videos = [];
                lista_data_videos.forEach(function(item, i) {
                    var it = item.replace('\\\'[', '[')
                                .replace(']\\\'', ']');
                    var jsonObj = JSON.parse(it);
                    jsonObj.forEach(element => {
                        profile.data_videos.push(element);
                    });
                });

                profiles.push(profile);
                
            } catch(e) {
                throw e;
            }
        });
        //#endregion

        //#region Paginação
        var objPage = {}
        objPage.has_next_page = false;
        var hasPagination = $('div.pagination').children('ul').length > 0;
        var hasNextPage = $('div.pagination').children('ul').find('li').find('a.no-page.next-page').length > 0;
        if(hasPagination) {
            objPage.has_next_page = true;
        }
        //#endregion

        var objData = {};                                    
        objData.page_info = objPage;
        objData.profiles = profiles;
        
        return objData;
    } catch(e) {
        throw new Error(e.message);
    }
}
//#endregion

//#region Amateurs
module.exports.getAmateurs = function(url) {    
    return new Promise((resolve, reject) => {
        var options = {
            url: url,
            method: 'GET'
        };
        request.get(options, (error, response, body) => {
            try {
                var objData = scrapeAmateursList(error, body);
                return resolve(objData);
            } catch(e) {
                return reject(new Error(e.message));
            }
        })
    })
}
// amateus-channel = https://www.xvideos.com/amateur-channels/poussey
// https://www.xvideos.com/amateurs/vanessa_love
function scrapeAmateursList(error, body) {
    if(error) {
        throw new Error(error.message);
    }
    if(body == null) {
        throw new Error('Body is empty');
    }

    try {
        var $ = cheerio.load(body);

        //#region Content
        var profiles = [];
        var contentHtml = $('.mozaique').children('div');
        contentHtml.each(function(i, item) {
            try {
                var div_elem = $(this);
                var id = div_elem.prop('id');
                var profile = {};
                
                profile.id = id;

                // profile name
                var div_p_n_elem = div_elem.find('p.profile-name > a');
                var p_n_href = div_p_n_elem.attr('href');            
                profile.name = div_p_n_elem.text();
                profile.href = p_n_href;

                // thumbs 01
                var div_thumbIns_elem = div_elem.find('div.thumb-inside');
                var country = div_thumbIns_elem.find('span.flag').attr('title');
                var iconClass = div_thumbIns_elem.find('span.flag').attr('class');
                profile.country = country;
                profile.icon_class = iconClass;

                // profile counts
                var div_p_c_elem = div_elem.find('p.profile-counts > span.with-sub');
                profile.count_videos = div_p_c_elem.text().replace(/\n/g, '').trim();

                // thumbs 02
                var thumb_elem = div_thumbIns_elem.find('.thumb');
                var anchor_elem = thumb_elem.find('a');
                profile.channels_link = anchor_elem.attr('href');

                var img_elem = anchor_elem.children('script')[0]
                                        .children[0].data
                                        .replace(/\n/g, '').trim()
                                        .split('document.write(xv.thumbs.replaceThumbUrl(\'')[1].trim()
                                        .replace('  />\'));', ' />');
                anchor_elem.append(img_elem);
                
                var img = anchor_elem.find('img').attr('src');
                profile.thumb = img;

                var lista_data_videos = [];
                var dataVideos = anchor_elem.find('img').attr('data-videos');
                lista_data_videos.push(dataVideos);

                profile.data_videos = [];
                lista_data_videos.forEach(function(item, i) {
                    var it = item.replace('\\\'[', '[')
                                .replace(']\\\'', ']');
                    var jsonObj = JSON.parse(it);
                    jsonObj.forEach(element => {
                        profile.data_videos.push(element);
                    });
                });

                profiles.push(profile);
                
            } catch(e) {
                throw e;
            }
        });
        //#endregion

        //#region Paginação
        var objPage = {}
        objPage.has_next_page = false;
        var hasPagination = $('div.pagination').children('ul').length > 0;
        var hasNextPage = $('div.pagination').children('ul').find('li').find('a.no-page.next-page').length > 0;
        if(hasPagination) {
            objPage.has_next_page = true;
        }
        //#endregion

        var objData = {};                                    
        objData.page_info = objPage;
        objData.profiles = profiles;
        
        return objData;
    } catch(e) {
        throw new Error(e.message);
    }
}
//#endregion

//#region Webcam
module.exports.getWebCamModels = function(url) {
    return new Promise((resolve, reject) => {
        var options = {
            url: url,
            method: 'GET'
        };
        request.get(options, (error, response, body) => {
            try {
                var objData = scrapeWebCamModelsList(error, body);
                return resolve(objData);
            } catch(e) {
                return reject(new Error(e.message));
            }
        })
    })
}

function scrapeWebCamModelsList(error, body) {
    if(error) {
        throw new Error(error.message);
    }
    if(body == null) {
        throw new Error('Body is empty');
    }

    try {
        var $ = cheerio.load(body);

        //#region Content
        var profiles = [];
        var contentHtml = $('.mozaique').children('div');
        contentHtml.each(function(i, item) {
            try {
                var div_elem = $(this);
                var id = div_elem.prop('id');
                var profile = {};
                
                profile.id = id;

                // profile name
                var div_p_n_elem = div_elem.find('p.profile-name > a');
                var p_n_href = div_p_n_elem.attr('href');            
                profile.name = div_p_n_elem.text();
                profile.href = p_n_href;

                // thumbs 01
                var div_thumbIns_elem = div_elem.find('div.thumb-inside');
                var country = div_thumbIns_elem.find('span.flag').attr('title');
                var iconClass = div_thumbIns_elem.find('span.flag').attr('class');
                profile.country = country;
                profile.icon_class = iconClass;

                // profile counts
                var div_p_c_elem = div_elem.find('p.profile-counts > span.with-sub');
                profile.count_videos = div_p_c_elem.text().replace(/\n/g, '').trim();

                // thumbs 02
                var thumb_elem = div_thumbIns_elem.find('.thumb');
                var anchor_elem = thumb_elem.find('a');
                profile.channels_link = anchor_elem.attr('href');

                var img_elem = anchor_elem.children('script')[0]
                                        .children[0].data
                                        .replace(/\n/g, '').trim()
                                        .split('document.write(xv.thumbs.replaceThumbUrl(\'')[1].trim()
                                        .replace('  />\'));', ' />');
                anchor_elem.append(img_elem);
                
                var img = anchor_elem.find('img').attr('src');
                profile.thumb = img;

                var lista_data_videos = [];
                var dataVideos = anchor_elem.find('img').attr('data-videos');
                lista_data_videos.push(dataVideos);

                profile.data_videos = [];
                lista_data_videos.forEach(function(item, i) {
                    var it = item.replace('\\\'[', '[')
                                .replace(']\\\'', ']');
                    var jsonObj = JSON.parse(it);
                    jsonObj.forEach(element => {
                        profile.data_videos.push(element);
                    });
                });

                profiles.push(profile);
                
            } catch(e) {
                throw e;
            }
        });
        //#endregion

        //#region Paginação
        var objPage = {}
        objPage.has_next_page = false;
        var hasPagination = $('div.pagination').children('ul').length > 0;
        var hasNextPage = $('div.pagination').children('ul').find('li').find('a.no-page.next-page').length > 0;
        if(hasPagination) {
            objPage.has_next_page = true;
        }
        //#endregion

        var objData = {};                                    
        objData.page_info = objPage;
        objData.profiles = profiles;
        
        return objData;
    } catch(e) {
        throw new Error(e.message);
    }
}
//#endregion

//#region Channels
module.exports.getChannels = function(url) {
    return new Promise((resolve, reject) => {
        var options = {
            url: url,
            method: 'GET'
        };
        request.get(options, (error, response, body) => {
            try {
                var objData = scrapeChannelsList(error, body);
                return resolve(objData);
            } catch(e) {
                return reject(new Error(e.message));
            }
        })
    })
}

function scrapeChannelsList(error, body) {
    if(error) {
        throw new Error(error.message);
    }
    if(body == null) {
        throw new Error('Body is empty');
    }
    try {
        var $ = cheerio.load(body);
        
        //#region Content
        var profiles = [];
        var contentHtml = $('.mozaique').children('div');
        contentHtml.each(function(i, item) {
            try {
                var div_elem = $(this);
                var id = div_elem.prop('id');
                var profile = {};
                
                profile.id = id;

                // profile name
                var div_p_n_elem = div_elem.find('p.profile-name > a');
                var p_n_href = div_p_n_elem.attr('href');            
                profile.name = div_p_n_elem.text();
                profile.href = p_n_href;

                // thumbs 01
                var div_thumbIns_elem = div_elem.find('div.thumb-inside');
                var country = div_thumbIns_elem.find('span.flag').attr('title');
                var iconClass = div_thumbIns_elem.find('span.flag').attr('class');
                profile.country = country;
                profile.icon_class = iconClass;

                // profile counts
                var div_p_c_elem = div_elem.find('p.profile-counts > span.with-sub');
                profile.count_videos = div_p_c_elem.text().replace(/\n/g, '').trim();

                // thumbs 02
                var thumb_elem = div_thumbIns_elem.find('.thumb');
                var anchor_elem = thumb_elem.find('a');
                profile.channels_link = anchor_elem.attr('href');

                var img_elem = anchor_elem.children('script')[0]
                                        .children[0].data
                                        .replace(/\n/g, '').trim()
                                        .split('document.write(xv.thumbs.replaceThumbUrl(\'')[1].trim()
                                        .replace('  />\'));', ' />');
                anchor_elem.append(img_elem);
                
                var img = anchor_elem.find('img').attr('src');
                profile.thumb = img;

                var lista_data_videos = [];
                var dataVideos = anchor_elem.find('img').attr('data-videos');
                lista_data_videos.push(dataVideos);

                profile.data_videos = [];
                lista_data_videos.forEach(function(item, i) {
                    var it = item.replace('\\\'[', '[')
                                .replace(']\\\'', ']');
                    var jsonObj = JSON.parse(it);
                    jsonObj.forEach(element => {
                        profile.data_videos.push(element);
                    });
                });

                profiles.push(profile);
                
            } catch(e) {
                throw e;
            }
        });
        //#endregion

        //#region Paginação
        var objPage = {}
        objPage.has_next_page = false;
        var hasPagination = $('div.pagination').children('ul').length > 0;
        var hasNextPage = $('div.pagination').children('ul').find('li').find('a.no-page.next-page').length > 0;
        if(hasPagination) {
            objPage.has_next_page = true;
        }
        //#endregion

        var objData = {};                                    
        objData.page_info = objPage;
        objData.profiles = profiles;

        return objData;
    } catch(e) {
        throw new Error(e.message);
    }
}
//#endregion

//#region Videos
module.exports.getVerifiedVideos = function(page = null) {
    return new Promise(function(resolve, reject) {

        var baseUrl = settings.XV_BASE_URL + '/verified/videos';
        
        if(page == null) {
            url = baseUrl;
        } else {
            url = baseUrl + '/' + page;
        }

        console.log(url)

        var options = {
            url: url,
            method: 'GET'
        };

        request(options, function(err, response, body) {
            if(err) {
                reject(new Error('Error while retrieve data page'));
            }

            if(body == null) {
                return reject(new Error('Body is empty'));
            }

            var $ = cheerio.load(body);

            try {
                var videos = [];
                var contentHtml = $('div.mozaique').children('div');
                contentHtml.each(function() {
                    var elem = $(this);
                    var obj = {};
                    obj.id = elem.find('div.thumb').find('a').children('img').prop('data-videoid');
                    obj.name = elem.find('div.thumb-under').find('p').find('a').attr('title')
                    obj.duration = elem.find('p.metadata').find('span.duration').text()//.length > 0 ? elem.children('p.metadata').find('span.duration').text().trim() : elem.children('p.metadata').find('span.duration').text();
                    obj.isHd = elem.find('div.thumb-inside').find('span.video-hd-mark').text().length > 0 ? true : false;
                    obj.link = elem.find('div.thumb').find('a').attr('href');
                    obj.thumb = elem.find('div.thumb').find('a').children('img').attr('data-src');
                    obj.href = elem.find('p.metadata').find('a.from-uploader').attr('href')
                    
                    var regExp = /\(([^)]+)\)/;
                    var matches = regExp.exec(elem.find('p.metadata').find('span.bg').text().trim().replace(/\n/g,''));
                    var upCountry = matches[1];
                    obj.uploader = { 
                        name: elem.find('p.metadata').find('a.from-uploader').text(), 
                        country: upCountry 
                    };
                    obj.views = ''

                    videos.push(obj);
                })

                //#region Paginação
                var objPage = {}
                objPage.has_next_page = false;
                var hasPagination = $('div.pagination').children('ul').length > 0;
                var hasNextPage = $('div.pagination').children('ul').find('li').find('a.no-page.next-page').length > 0;
                if(hasPagination) {
                    objPage.has_next_page = true;
                }
                //#endregion

                var objData = {};                                    
                objData.page_info = objPage;
                objData.videos = videos;

            } catch(e) {
                return reject(new Error(e.message))
            }

            return resolve(objData);
        });
    });
}
module.exports.getBestVideos = function(url) {
    return new Promise(function(resolve, reject) {

        var options = {
            url: url,
            method: 'GET'
        };

        console.log(url)

        request(options, function(err, response, body) {
            if(err) {
                reject(new Error('Error while retrieve data page'));
            }

            if(body == null) {
                return reject(new Error('Body is empty'));
            }

            var $ = cheerio.load(body);

            try {
                var videos = [];
                var contentHtml = $('div.mozaique').children('div');
                contentHtml.each(function() {
                    var elem = $(this);
                    var obj = {};
                    obj.id = elem.find('div.thumb').find('a').children('img').prop('data-videoid');
                    obj.name = elem.find('div.thumb-under').find('p').find('a').attr('title')
                    obj.duration = elem.find('p.metadata').find('span.duration').text()//.length > 0 ? elem.children('p.metadata').find('span.duration').text().trim() : elem.children('p.metadata').find('span.duration').text();
                    obj.isHd = elem.find('div.thumb-inside').find('span.video-hd-mark').text().length > 0 ? true : false;
                    obj.link = elem.find('div.thumb').find('a').attr('href');
                    obj.thumb = elem.find('div.thumb').find('a').children('img').attr('data-src');
                    obj.href = elem.find('p.metadata').find('a').attr('href')
                    
                    // var regExp = /\(([^)]+)\)/;
                    // var matches = regExp.exec(elem.find('p.metadata').find('span.bg').text().trim().replace(/\n/g,''));
                    // var upCountry = matches[1];
                    obj.uploader = { 
                        name: elem.find('p.metadata').find('a').text(), 
                        country: '' 
                    };
                    
                    var views = elem.find('p.metadata').find('span.bg').find('span').text().trim().split('-')[1]
                    obj.views = views.trim()
                    
                    videos.push(obj);
                })

                //#region Paginação
                var objPage = {}
                objPage.has_next_page = false;
                var hasPagination = $('div.pagination').children('ul').length > 0;
                var hasNextPage = $('div.pagination').children('ul').find('li').find('a.no-page.next-page').length > 0;
                if(hasPagination) {
                    objPage.has_next_page = true;
                }
                //#endregion

                var objData = {};                                    
                objData.page_info = objPage;
                objData.videos = videos;

            } catch(e) {
                return reject(new Error(e.message))
            }

            return resolve(objData);
        });
    });
}
module.exports.getVideoUrl = function(url) {
    return new Promise((resolve, reject) => {

        var options = {
            url: url
        };

        console.log(url)

        request.get(options, (error, response, body) => {
            if(error) {
                reject(new Error('Error while retrieve data page'));
            }

            if(body == null) {
                return reject(new Error('Body is empty'));
            }
            
            try {
                var $ = cheerio.load(body);
                var scriptTag = $('#main').children('div#content').find('div#video-player-bg').find('script')[4].children[0].data                
                var str_1 = scriptTag.split('html5player.setVideoUrlHigh(')[1]
                var str_2 = str_1.split('\');')
                var video_url = str_2[0].replace('\'', '')

                var str_3 = scriptTag.split('html5player.setVideoTitle(')[1]
                var str_4 = str_3.split('\');')
                var video_title = str_4[0].replace('\'', '')

                var str_5 = scriptTag.split('html5player.setThumbUrl(')[1]
                var str_6 = str_5.split('\');')
                var video_thumbUrl = str_6[0].replace('\'', '')

                var str_7 = scriptTag.split('html5player.setThumbUrl169(')[1]
                var str_8 = str_7.split('\');')
                var video_thumbUrl169 = str_8[0].replace('\'', '')

                var str_9 = scriptTag.split('html5player.setThumbSlide(')[1]
                var str_10 = str_9.split('\');')
                var video_thumbSlide = str_10[0].replace('\'', '')

                var str_11 = scriptTag.split('html5player.setThumbSlideBig(')[1]
                var str_12 = str_11.split('\');')
                var video_thumbSlideBig = str_12[0].replace('\'', '')
                                
                var objData = {
                    url: video_url,
                    video_high_qual: $('#html5video_base').children('div').find('a')[2].attribs.href,
                    video_title: video_title,
                    video_thumbs: [video_thumbUrl, video_thumbUrl169],
                    video_mozaiques: [video_thumbSlide, video_thumbSlideBig]
                }
                                
                return resolve(objData);
            } catch(e) {
                return reject(new Error(e.message));
            }
        })
    })
}
module.exports.getVideo = function(videoId, titleId) {
    return new Promise((resolve, reject) => {
        if(!videoId) {
            return reject(new Error('Argument "url_video_id" must be specified'));
        }

        if(!titleId) {
            return reject(new Error('Argument "url_video_title" must be specified'));
        }

        var url = `${settings.XV_BASE_URL}/${videoId}/${titleId}`

        var options = {
            url: url
        };

        console.log(url)

        request.get(options, (error, response, body) => {
            if(error) {
                reject(new Error('Error while retrieve data page'));
            }

            if(body == null) {
                return reject(new Error('Body is empty'));
            }

            try {
                var objData = {
                    id: '',
                    title: '',
                    duration: '',
                    tags: []
                }
            } catch(e) {
                return reject(new Error(e.message));
            }
        })
    })
}
//#endregion

//#region ProfileList - Models
module.exports.getProfiles = function(url) {
    return new Promise((resolve, reject) => {
        var options = {
            url: url,
            method: 'GET'
        };
        request.get(options, (error, response, body) => {
            try {
                var objData = scrapeProfilesList(error, body);
                return resolve(objData);
            } catch(e) {
                return reject(new Error(e.message));
            }
        })
    })
}
// ??????
module.exports.getProfilesListByName = function(name, tab = null) {
    return new Promise(function(resolve, reject) {
        if(!name) {
            return reject(new Error('Argument "name" must be specified'));
        }

        var baseUrl = settings.XV_BASE_URL + '/profiles/' + name;

        if(tab == null) {
            url = baseUrl + '#_tabAboutMe';
        } else {
            url = baseUrl + tab;
        }

        var options = {
            url: url,
            method: 'GET'
        };

        var html = fs.readFileSync('pages-examples/profilelist-models/models-nome-models-videoActive.html');
        var body = html.toString('utf8');
        var $ = cheerio.load(body);

        var objData = {};
        objData.profile = {};

        try {
            var mainHtml = $('div#main');
            var title = mainHtml.children('div#profile-title');
            title.filter(function() {
                var elem = $(this)
                var name = elem.children('h2').find('strong').text();
                objData.profile.name = name;
            })
/*
            // _tabAboutMe
            objData.profile.about_me = {};
            var tabAboutMe = mainHtml.children('div#profile-tabs').find('div.tabs > div#tabAboutMe > div.row');
            tabAboutMe.filter(function() {
                var elem = $(this);

                var objInfo1 = {};
                objInfo1.profile_pic = null;
                objInfo1.gender = null;
                objInfo1.age = null;
                objInfo1.country = null;
                objInfo1.profile_hits = null;
                objInfo1.subscribers = null;
                objInfo1.videos_views = null;
                objInfo1.pornstar_views = null;
                objInfo1.profile_rankings = [];
                objInfo1.channels_rankings = [];
                objInfo1.pornstars_rankings = [];
                objInfo1.region = null;
                objInfo1.languages = [];
                objInfo1.signed_up = null;
                objInfo1.last_activity = null;

                objInfo1.ethnicity = null;
                objInfo1.body = null;
                objInfo1.height = null;
                objInfo1.weight = null;
                objInfo1.hair_length = null;
                objInfo1.hair_color = null;
                objInfo1.eyes_color = null;
                objInfo1.aboutme_label = null;
                objInfo1.website = null;
                objInfo1.aboutme = null;
                objInfo1.video_tags = null;

                var profile_pic = elem.find('div#pfinfo-col-pict > div.profile-pic').find('img').attr('src');
                objInfo1.profile_pic = profile_pic;
                
                var p_info1_elem = elem.find('div#pfinfo-col-col1').find('p');
                p_info1_elem.each(function() {
                    var p_elem = $(this);
                    var id = p_elem.prop('id');

                    if(id == "pinfo-sex") {
                        objInfo1.gender = p_elem.find('span').text().trim();
                    }

                    if(id == "pinfo-age") {
                        objInfo1.age = p_elem.find('span').text().trim();
                    }

                    if(id == "pinfo-country") {
                        objInfo1.country = p_elem.find('span').text().trim();
                    }

                    if(id == "pinfo-profile-hits") {
                        objInfo1.profile_hits = p_elem.find('span').text().trim();
                    }

                    if(id == "pinfo-subscribers") {
                        objInfo1.subscribers = p_elem.find('span').text().trim();
                    }

                    if(id == "pinfo-videos-views") {
                        objInfo1.videos_views = p_elem.find('span').text().trim();
                    }

                    if(id == "pinfo-pornstar-views") {
                        objInfo1.pornstar_views = p_elem.find('span').text().trim();
                    }

                    if(id == "pinfo-pornstar-ranks") {
                        var obj = {};
                        var spans = p_elem.find('span');
                        spans.each(function() {
                            var splits = $(this).text()
                                              .replace(/\t/g,'').trim()
                                              .replace(/\n/g,'').split('#');
                            obj.type = splits[0].trim();
                            obj.svalue = splits[1];
                            objInfo1.amateurs_rankings.push(obj);
                        });
                    }

                    if(id == "pinfo-channel-ranks") {
                        var obj = {};
                        var spans = p_elem.find('span');
                        spans.each(function() {
                            var splits = $(this).text()
                                              .replace(/\t/g,'').trim()
                                              .replace(/\n/g,'').split('#');
                            obj.type = splits[0].trim();
                            obj.svalue = splits[1];
                            objInfo1.channels_rankings.push(obj);
                        });
                    }

                    if(id == "pinfo-pornstar-global-ranks") {
                        var obj = {};
                        var spans = p_elem.find('span');
                        spans.each(function() {
                            var splits = $(this).text()
                                              .replace(/\t/g,'').trim()
                                              .replace(/\n/g,'').split('#');
                            obj.type = splits[0].trim();
                            obj.svalue = splits[1];
                            objInfo1.pornstars_rankings.push(obj);
                        });
                    }

                    if(id == "pinfo-region") {
                        objInfo1.region = p_elem.find('span').text().trim();
                    }

                    if(id == "pinfo-languages") {
                        var idiomas = p_elem.find('span').text().split(',');
                        for (var i = 0; i < idiomas.length; i++) {
                            var idioma = idiomas[i].trim();
                            objInfo1.languages.push(idioma);
                        }
                    }

                    if(id == "pinfo-signedup") {
                        objInfo1.signed_up = p_elem.find('span').text().trim();
                    }

                    if(id == "pinfo-lastactivity") {
                        objInfo1.last_activity = p_elem.find('span').text().trim();
                    }
                });

                var p_info2_elem = elem.find('div#pfinfo-col-col2').find('p');
                p_info2_elem.each(function() {
                    var p_elem = $(this);
                    var id = p_elem.prop('id');

                    if(id == 'pinfo-ethnicity') {
                        objInfo1.ethnicity = p_elem.find('span').text().trim();
                    }

                    if(id == 'pinfo-body') {
                        objInfo1.body = p_elem.find('span').text().trim();
                    }

                    if(id == 'pinfo-height') {
                        objInfo1.height = p_elem.find('span').text().trim();
                    }

                    if(id == 'pinfo-weight') {
                        objInfo1.weight = p_elem.find('span').text().trim();
                    }

                    if(id == 'pinfo-hair_length') {
                        objInfo1.hair_length = p_elem.find('span').text().trim();
                    }

                    if(id == 'pinfo-hair_color') {
                        objInfo1.hair_color = p_elem.find('span').text().trim();
                    }

                    if(id == 'pinfo-eyes_color') {
                        objInfo1.eyes_color = p_elem.find('span').text().trim();
                    }

                    if(id == 'pinfo-aboutme-label') {
                        objInfo1.aboutme_label = p_elem.find('span').text().trim();
                    }

                    if(id == 'pinfo-website') {
                        objInfo1.website = p_elem.find('span').text().trim();
                    }

                    if(id == 'pinfo-aboutme') {
                        objInfo1.aboutme = p_elem.text()
                                                .replace(/<br \/>/g,'&nbsp;')
                                                .replace(/\t/g, '')
                                                .replace(/\n/g, '')
                                                .replace('Mostrar mais', '').trim();
                    }

                    if(id == 'pinfo-video-tags') {
                        objInfo1.video_tags = p_elem.find('span').text().trim();
                    }
                });

                objData.profile.about_me = objInfo1;
            });

            // _tabPhotos
            objData.profile.photos = {};
            var tabPhotos = mainHtml.children('div#profile-tabs').find('div.tabs > div#tabPhotos > div#profile-galleries')
            tabPhotos.filter(function() {
                var elem = $(this);

                var objInfo2 = {};
                objInfo2.info = null;
                objInfo2.photos = [];

                var info = elem.find('h4').text().replace(/<br \/>/g,'&nbsp;')
                                                 .replace(/\t/g, '')
                                                 .replace(/\n/g, '').trim();
                objInfo2.info = info;

                var albumList = elem.children('div.thumb-mozaique.mozaique.profileslist').children('div');
                albumList.each(function() {
                    var item = $(this);
                    var id = item.prop('data-galid');
                    
                    var name = item.find('p.name').find('a').text().length > 0 ? item.find('p.name').find('a').text() : null;
                    var link = item.find('p.name').find('a').attr('href') == undefined ? null : item.find('p.name').find('a').attr('href');
                    var isAlbum = link == null ? false : true;
                    var count_pic = getOnlyNumbers(item.find('p.rating').find('strong').text());
                    var update_info = item.find('p.update').find('small').text().length > 0 ? item.find('p.update').find('small').text() : null;
                    
                    // thumb-inside
                    var div_thumbIns_elem = item.find('div.thumb-inside');
                    var thumb_elem = div_thumbIns_elem.find('.thumb');

                    var anchor_elem = thumb_elem.find('a');
                    var img_elem = anchor_elem.children('script')[0]
                                            .children[0].data
                                            .replace(/\n/g, '').trim()
                                            .split('document.write(xv.thumbs.replaceThumbUrl(\'')[0].trim()
                                            .replace('  />\'));', ' />');
                    anchor_elem.append(img_elem);
                    
                    var img = anchor_elem.find('img').attr('src');
                    
                    var obj = {};
                    obj.name = name;
                    obj.link = link;
                    obj.isAlbum = isAlbum;
                    obj.img = img;
                    obj.count_pic = count_pic;
                    obj.update_info = update_info;

                    objInfo2.photos.push(obj);
                    
                });

                objData.profile.photos = objInfo2;
            });

            // _tabVideos
            objData.profile.videos = [];
            var content = $('div#main').children('div#profile-tabs').children('div.tabs > div#tabVideos > div > div#profile-listing-pornstar > div > div.mozaique');
            content.each(function() {
                var elem = $(this);
                console.log(elem.prop('id'));
            })
*/


            /*
            var tabVideos = mainHtml.children('div#profile-tabs.xv-tabs').children('div.tabs > div#tabVideos > div.mozaique')
            tabVideos.filter(function() {
                var elem = $(this);
                var info = elem.find('h4').text().replace(/<br \/>/g,'&nbsp;')
                                                 .replace(/\t/g, '')
                                                 .replace(/\n/g, '').trim()
                                                 .split('(')[0];                
                var videosHtml = elem.find('div.mozaique').children('div');
                videosHtml.each(function() {
                    var item = $(this);
                    var title = item.find('p > a').text().trim();
                    var link = item.find('p > a').attr('href');
                    var duration = item.find('p.metadata').find('span.duration').text().trim();
                    var visualizacoes = item.find('p.metadata').find('span.bg').children('span').remove().end().text()
                                                                               .replace(/<br \/>/g,'&nbsp;')
                                                                               .replace(/\t/g, '')
                                                                               .replace(/\n/g, '')
                                                                               .split(' Visualizações')[0];

                    var isHd = item.find('div.thumb-inside').find('span.video-hd-mark').length > 0 ? true : false;
                    var thumb = item.find('div.thumb-inside').find('div.thumb');
                    var anchor_elem = thumb.find('a');
                    // var img_elem = anchor_elem.children('script')[0]
                    //                         .children[0].data
                    //                         .replace(/\n/g, '').trim()
                    //                         .split('document.write(xv.thumbs.replaceThumbUrl(\'')[0].trim()
                    //                         .replace('  />\'));', ' />');
                    // anchor_elem.append(img_elem);
                    
                    // var img = anchor_elem.find('img').attr('src');
                });
            });
            */

        } catch(e) {
            console("[==== ERROR ====]:", err);
            return reject(new Error('Error while retrieve data: ' + e.message));
        }
        console.log(objData.profile)
        /*
        request(options, function(err, response, body) {
            if(err) {
                reject(new Error('Error while retrieve data page'));
            }

            if(body == null) {
                return reject(new Error('Body is empty'));
            }

            var $ = cheerio.load(body);

            return resolve(objData);
        });
        */
    });
}
// ??????
module.exports.getProfilesListModelsByName = function(name, tab = null) {
    return new Promise(function(resolve, reject) {
        if(!name) {
            return reject(new Error('Argument "name" must be specified'));
        }

        var baseUrl = settings.XV_BASE_URL + '/models/' + name;

        if(tab == null) {
            url = baseUrl + '#_tabAboutMe';
        } else {
            url = baseUrl + tab;
        }

        var options = {
            url: url,
            method: 'GET'
        };
        
        var html = fs.readFileSync('pages-examples/profilelist-models/models-nome-models-videoActive.html');
        var body = html.toString('utf8');
        var $ = cheerio.load(body);
        

        var objData = {};
        objData.profile = {};

        try {
            var mainHtml = $('div#main');

            var profileTitle = mainHtml.children('div#profile-title');            
            
            // profileTitle.filter(function() {
            //     var elem = $(this);
            //     var profilePic = elem.children('div.profile-pic').find('img').attr('src');
            //     var profileName = elem.children('h2').find('strong').text()
            //     //.children('span.mobile-show-inline').remove().end().text().find('strong').text()
            //     console.log(profileName)
            //     // 
            // });
            
/*
            // _tabAboutMe
            objData.profile.about_me = {};
            var tabAboutMe = mainHtml.children('div#profile-tabs').find('div.tabs > div#tabAboutMe > div.row');
            tabAboutMe.filter(function() {
                var elem = $(this);

                var objInfo1 = {};
                objInfo1.profile_pic = null;
                objInfo1.gender = null;
                objInfo1.age = null;
                objInfo1.country = null;
                objInfo1.profile_hits = null;
                objInfo1.subscribers = null;
                objInfo1.videos_views = null;
                objInfo1.pornstar_views = null;
                objInfo1.profile_rankings = [];
                objInfo1.channels_rankings = [];
                objInfo1.pornstars_rankings = [];
                objInfo1.region = null;
                objInfo1.languages = [];
                objInfo1.signed_up = null;
                objInfo1.last_activity = null;

                objInfo1.ethnicity = null;
                objInfo1.body = null;
                objInfo1.height = null;
                objInfo1.weight = null;
                objInfo1.hair_length = null;
                objInfo1.hair_color = null;
                objInfo1.eyes_color = null;
                objInfo1.aboutme_label = null;
                objInfo1.website = null;
                objInfo1.aboutme = null;
                objInfo1.video_tags = null;

                var profile_pic = elem.find('div#pfinfo-col-pict > div.profile-pic').find('img').attr('src');
                objInfo1.profile_pic = profile_pic;
                
                var p_info1_elem = elem.find('div#pfinfo-col-col1').find('p');
                p_info1_elem.each(function() {
                    var p_elem = $(this);
                    var id = p_elem.prop('id');

                    if(id == "pinfo-sex") {
                        objInfo1.gender = p_elem.find('span').text().trim();
                    }

                    if(id == "pinfo-age") {
                        objInfo1.age = p_elem.find('span').text().trim();
                    }

                    if(id == "pinfo-country") {
                        objInfo1.country = p_elem.find('span').text().trim();
                    }

                    if(id == "pinfo-profile-hits") {
                        objInfo1.profile_hits = p_elem.find('span').text().trim();
                    }

                    if(id == "pinfo-subscribers") {
                        objInfo1.subscribers = p_elem.find('span').text().trim();
                    }

                    if(id == "pinfo-videos-views") {
                        objInfo1.videos_views = p_elem.find('span').text().trim();
                    }

                    if(id == "pinfo-pornstar-views") {
                        objInfo1.pornstar_views = p_elem.find('span').text().trim();
                    }

                    if(id == "pinfo-pornstar-ranks") {
                        var obj = {};
                        var spans = p_elem.find('span');
                        spans.each(function() {
                            var splits = $(this).text()
                                              .replace(/\t/g,'').trim()
                                              .replace(/\n/g,'').split('#');
                            obj.type = splits[0].trim();
                            obj.svalue = splits[1];
                            objInfo1.amateurs_rankings.push(obj);
                        });
                    }

                    if(id == "pinfo-channel-ranks") {
                        var obj = {};
                        var spans = p_elem.find('span');
                        spans.each(function() {
                            var splits = $(this).text()
                                              .replace(/\t/g,'').trim()
                                              .replace(/\n/g,'').split('#');
                            obj.type = splits[0].trim();
                            obj.svalue = splits[1];
                            objInfo1.channels_rankings.push(obj);
                        });
                    }

                    if(id == "pinfo-pornstar-global-ranks") {
                        var obj = {};
                        var spans = p_elem.find('span');
                        spans.each(function() {
                            var splits = $(this).text()
                                              .replace(/\t/g,'').trim()
                                              .replace(/\n/g,'').split('#');
                            obj.type = splits[0].trim();
                            obj.svalue = splits[1];
                            objInfo1.pornstars_rankings.push(obj);
                        });
                    }

                    if(id == "pinfo-region") {
                        objInfo1.region = p_elem.find('span').text().trim();
                    }

                    if(id == "pinfo-languages") {
                        var idiomas = p_elem.find('span').text().split(',');
                        for (var i = 0; i < idiomas.length; i++) {
                            var idioma = idiomas[i].trim();
                            objInfo1.languages.push(idioma);
                        }
                    }

                    if(id == "pinfo-signedup") {
                        objInfo1.signed_up = p_elem.find('span').text().trim();
                    }

                    if(id == "pinfo-lastactivity") {
                        objInfo1.last_activity = p_elem.find('span').text().trim();
                    }
                });

                var p_info2_elem = elem.find('div#pfinfo-col-col2').find('p');
                p_info2_elem.each(function() {
                    var p_elem = $(this);
                    var id = p_elem.prop('id');

                    if(id == 'pinfo-ethnicity') {
                        objInfo1.ethnicity = p_elem.find('span').text().trim();
                    }

                    if(id == 'pinfo-body') {
                        objInfo1.body = p_elem.find('span').text().trim();
                    }

                    if(id == 'pinfo-height') {
                        objInfo1.height = p_elem.find('span').text().trim();
                    }

                    if(id == 'pinfo-weight') {
                        objInfo1.weight = p_elem.find('span').text().trim();
                    }

                    if(id == 'pinfo-hair_length') {
                        objInfo1.hair_length = p_elem.find('span').text().trim();
                    }

                    if(id == 'pinfo-hair_color') {
                        objInfo1.hair_color = p_elem.find('span').text().trim();
                    }

                    if(id == 'pinfo-eyes_color') {
                        objInfo1.eyes_color = p_elem.find('span').text().trim();
                    }

                    if(id == 'pinfo-aboutme-label') {
                        objInfo1.aboutme_label = p_elem.find('span').text().trim();
                    }

                    if(id == 'pinfo-website') {
                        objInfo1.website = p_elem.find('span').text().trim();
                    }

                    if(id == 'pinfo-aboutme') {
                        objInfo1.aboutme = p_elem.text()
                                                .replace(/<br \/>/g,'&nbsp;')
                                                .replace(/\t/g, '')
                                                .replace(/\n/g, '')
                                                .replace('Mostrar mais', '').trim();
                    }

                    if(id == 'pinfo-video-tags') {
                        objInfo1.video_tags = p_elem.find('span').text().trim();
                    }
                });

                objData.profile.about_me = objInfo1;
            });

            // _tabPhotos
            objData.profile.photos = {};
            var tabPhotos = mainHtml.children('div#profile-tabs').find('div.tabs > div#tabPhotos > div#profile-galleries')
            tabPhotos.filter(function() {
                var elem = $(this);

                var objInfo2 = {};
                objInfo2.info = null;
                objInfo2.photos = [];

                var info = elem.find('h4').text().replace(/<br \/>/g,'&nbsp;')
                                                 .replace(/\t/g, '')
                                                 .replace(/\n/g, '').trim();
                objInfo2.info = info;

                var albumList = elem.children('div.thumb-mozaique.mozaique.profileslist').children('div');
                albumList.each(function() {
                    var item = $(this);
                    var id = item.prop('data-galid');
                    
                    var name = item.find('p.name').find('a').text().length > 0 ? item.find('p.name').find('a').text() : null;
                    var link = item.find('p.name').find('a').attr('href') == undefined ? null : item.find('p.name').find('a').attr('href');
                    var isAlbum = link == null ? false : true;
                    var count_pic = getOnlyNumbers(item.find('p.rating').find('strong').text());
                    var update_info = item.find('p.update').find('small').text().length > 0 ? item.find('p.update').find('small').text() : null;
                    
                    // thumb-inside
                    var div_thumbIns_elem = item.find('div.thumb-inside');
                    var thumb_elem = div_thumbIns_elem.find('.thumb');

                    var anchor_elem = thumb_elem.find('a');
                    var img_elem = anchor_elem.children('script')[0]
                                            .children[0].data
                                            .replace(/\n/g, '').trim()
                                            .split('document.write(xv.thumbs.replaceThumbUrl(\'')[0].trim()
                                            .replace('  />\'));', ' />');
                    anchor_elem.append(img_elem);
                    
                    var img = anchor_elem.find('img').attr('src');
                    
                    var obj = {};
                    obj.name = name;
                    obj.link = link;
                    obj.isAlbum = isAlbum;
                    obj.img = img;
                    obj.count_pic = count_pic;
                    obj.update_info = update_info;

                    objInfo2.photos.push(obj);
                    
                });

                objData.profile.photos = objInfo2;
            });

            // _tabVideos
            objData.profile.videos = [];
            var content = $('div#main').children('div#profile-tabs').children('div.tabs > div#tabVideos > div > div#profile-listing-pornstar > div > div.mozaique');
            content.each(function() {
                var elem = $(this);
                console.log(elem.prop('id'));
            })
*/


            objData.profile.videos = [];
            var profileTabs = $('div#main').children('div#profile-tabs')
            profileTabs.filter(function() {
                var item = $(this);
                var tabs = item.children('div.tabs').find('div#tabVideos > div');
                var plp = tabs.children('div#profile-listing-pornstar').find('div > div.mozaique');
                plp.each(function() {
                    var elem = $(this);
                    console.log(elem.prop('id'))
                })
            });
            
            

        } catch(e) {
            console("[==== ERROR ====]:", err);
            return reject(new Error('Error while retrieve data: ' + e.message));
        }
        console.log(objData.profile)



        /*
        request(options, function(err, response, body) {
            if(err) {
                reject(new Error('Error while retrieve data page'));
            }

            if(body == null) {
                return reject(new Error('Body is empty'));
            }

            var $ = cheerio.load(body);

            return resolve(objData);
        });
        */
    });
}

function scrapeProfilesList(error, body) {
    if(error) {
        throw new Error(error.message);
    }
    if(body == null) {
        throw new Error('Body is empty');
    }

    try {
        var $ = cheerio.load(body);
        
        //#region Content
        var count = $('div#profile-search-filters-summary').children('span.label-contracted').text().trim();
        var profiles = [];
        var contentHtml = $('div.mozaique.profileslist').children('div');
        contentHtml.each(function() {
            var elem = $(this);
            var obj = {};
            obj.name = elem.children('p.profile-name').find('a').text();
            obj.link = elem.find('div.thumb').find('a').attr('href');
            obj.country = elem.children('div.thumb-inside').find('span.flag').attr('title');
            obj.icon_class = elem.children('div.thumb-inside').find('span.flag').attr('class');
            
            var info1 = elem.children('p.profile-info').text().length > 0 ? elem.children('p.profile-info').text().replace(/(\r\n\t|\n|\r\t)/gm,"").replace(/\t/g, '') : null;
            var info2 = elem.children('p.profile-counts').text().length > 0 ? elem.children('p.profile-counts').text().replace(/(\r\n\t|\n|\r\t)/gm,"").replace(/\t/g, '') : null;
            var counts = [];

            if(info2 != null) {
                if(info2.indexOf('-') > 0) {
                    counts = info2.split('-');
                } else {
                    counts.push(info2);                        
                }
            }
            
            obj.info = {
                profile_info: info1,
                profile_counts: counts
            }

            var thumb_anchor = elem.children('div.thumb-inside').find('div.thumb').find('a');
            obj.thumb = thumb_anchor.find('img').attr('src');
            profiles.push(obj);
        });
        //#endregion

        //#region Paginação
        var objPage = {}
        objPage.has_next_page = false;
        var hasPagination = $('div.pagination').children('ul').length > 0;
        var hasNextPage = $('div.pagination').children('ul').find('li').find('a.no-page.next-page').length > 0;
        if(hasPagination) {
            objPage.has_next_page = true;
        }
        //#endregion

        var objData = {};
        objData.page_info = objPage;
        objData.count = count
        objData.profiles = profiles;
        
        return objData;

    } catch(e) {
        throw new Error(e.message);
    }
}
//#endregion

module.exports.getEntitiesList = function(url) {
    return new Promise(function(resolve, reject) {

        var options = {
            url: url,
            method: 'GET'
        };
        
        request(options, function(err, response, body) {
            if(err) {
                reject(new Error('Error while retrieve data page'));
            }

            if(body == null) {
                return reject(new Error('Body is empty'));
            }

            var $ = cheerio.load(body);

            try {
                var models_list = [];
                var contentHtml = $('div#main>ul.tags-list').children('li');
                contentHtml.each(function() {
                    var elem = $(this);
                    var obj = {};
                    var anchor_elem = elem.find('a');

                    var iconClass = anchor_elem.find('span').attr('class');
                    var country = iconClass.split('flag-small ')[1];
                    country = country.split('-')[1];
                    obj.name = anchor_elem.text().trim();
                    obj.link = anchor_elem.attr('href');
                    obj.country = country;
                    obj.icon_class = iconClass.split('flag-small ')[1];
                    models_list.push(obj);
                });

                var objData = {};
                objData.list = models_list;

                return resolve(objData);

            } catch(e) {
                return reject(new Error(e.message));
            }
        });
        
    });
}
module.exports.getEntitiesCountries = function(url) {
    return new Promise(function(resolve, reject) {                
        var options = {
            url: url,
            method: 'GET'
        };

        request(options, function(err, response, body) {
            if(err) {
                reject(new Error('Error while retrieve data page'));
            }

            if(body == null) {
                return reject(new Error('Body is empty'));
            }

            var $ = cheerio.load(body);
                        
            try {
                var countries = []
                var contentHtml = $('div#main>ul.tags-list').children('li');
                contentHtml.each(function() {
                    var elem = $(this);
                    var obj = {};
                    var anchor_elem = elem.find('a');

                    var country_name = anchor_elem.find('b').text().trim();
                    var iconClass = anchor_elem.find('b').find('span').attr('class');
                    var country = iconClass.split('flag-small ')[1];
                    country = country.split('-')[1];

                    obj.country_name = country_name;
                    obj.country = country;
                    obj.link = anchor_elem.attr('href');                    
                    obj.count = anchor_elem.find('span.navbadge').text().trim();
                    obj.icon_class = iconClass.split('flag-small ')[1];
                    countries.push(obj);                    
                });

                var objData = {};
                objData.countries = countries;
                return resolve(objData);
            } catch(e) {
                return reject(new Error(e.message));
            }
        });
    });
}
module.exports.getEntitiesByCountry = function(url) {
    return new Promise(function(resolve, reject) {
        var options = {
            url: url,
            method: 'GET'
        };

        request(options, function(err, response, body) {
            if(err) {
                reject(new Error('Error while retrieve data page'));
            }

            if(body == null) {
                return reject(new Error('Body is empty'));
            }

            var $ = cheerio.load(body);
            
            //#region Content
            var profiles = [];
            var contentHtml = $('.mozaique').children('div');
            contentHtml.each(function(i, item) {
                try {
                    var div_elem = $(this);
                    var id = div_elem.prop('id');
                    var profile = {};
                    
                    profile.id = id;

                    // profile name
                    var div_p_n_elem = div_elem.find('p.profile-name > a');
                    var p_n_href = div_p_n_elem.attr('href');            
                    profile.name = div_p_n_elem.text();
                    profile.href = p_n_href;

                    // thumbs 01
                    var div_thumbIns_elem = div_elem.find('div.thumb-inside');
                    var country = div_thumbIns_elem.find('span.flag').attr('title');
                    var iconClass = div_thumbIns_elem.find('span.flag').attr('class');
                    profile.country = country;
                    profile.icon_class = iconClass;

                    // profile counts
                    var div_p_c_elem = div_elem.find('p.profile-counts > span.with-sub');
                    profile.count_videos = div_p_c_elem.text().replace(/\n/g, '').trim();

                    // thumbs 02
                    var thumb_elem = div_thumbIns_elem.find('.thumb');
                    var anchor_elem = thumb_elem.find('a');
                    profile.channels_link = anchor_elem.attr('href');

                    var img_elem = anchor_elem.children('script')[0]
                                            .children[0].data
                                            .replace(/\n/g, '').trim()
                                            .split('document.write(xv.thumbs.replaceThumbUrl(\'')[1].trim()
                                            .replace('  />\'));', ' />');
                    anchor_elem.append(img_elem);
                    
                    var img = anchor_elem.find('img').attr('src');
                    profile.thumb = img;

                    var lista_data_videos = [];
                    var dataVideos = anchor_elem.find('img').attr('data-videos');
                    lista_data_videos.push(dataVideos);

                    profile.data_videos = [];
                    lista_data_videos.forEach(function(item, i) {
                        var it = item.replace('\\\'[', '[')
                                    .replace(']\\\'', ']');
                        var jsonObj = JSON.parse(it);
                        jsonObj.forEach(element => {
                            profile.data_videos.push(element);
                        });
                    });

                    profiles.push(profile);
                    
                } catch(e) {
                    return reject(new Error(e.message));
                }
            });
            //#endregion

            //#region Paginação
            var objPage = {}
            objPage.has_next_page = false;
            var hasPagination = $('div.pagination').children('ul').length > 0;
            var hasNextPage = $('div.pagination').children('ul').find('li').find('a.no-page.next-page').length > 0;
            if(hasPagination) {
                objPage.has_next_page = true;
            }
            //#endregion
            
            var objData = {};                                    
            objData.page_info = objPage;
            objData.profiles = profiles;

            return resolve(objData);
        });
    });
}



//#region Functions
var encodeParameter = function(value) {
    if(value == '' || value == null) {
        return new Error('Argument "value" must be specified');
    }

    return encodeURI(value).replace(/%20/g,'+');
}
var urlIndexByRegion = function(prefix, region) {
    if(prefix == null) {
        return new Error('Argument "prefix" must be specified');
    }

    var baseUrl = settings.XV_BASE_URL + '/' + prefix;    
    if(region != null) {
        if(region == 'brazil') {
            return baseUrl + '/brazil';
        } else if(region == 'latin') {
            return baseUrl + '/latin';
        }
    } else {
        return baseUrl;
    }    
}
var getOnlyNumbers = function(str) {
    var regex = /\d+/g;
    if(str.length == 0) {
        return 1;
    }    
    return str.match(regex)[0];
}
//#endregion