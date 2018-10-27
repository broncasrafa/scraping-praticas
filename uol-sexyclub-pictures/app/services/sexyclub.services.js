var request = require('request');
var Promise = require('bluebird');
var settings = require('../../config/appSettings');
var cheerio = require('cheerio');

// tokens = https://croupier.mais.uol.com.br/v3/formats/16321854/jsonp

exports.getModels = function(url) {
    return new Promise((resolve, reject) => {
        console.log(url)
        var options = {
            url: url,
            method: 'GET',
            headers: {
                'User-Agent': settings.USER_AGENT,
                'Cookie': settings.COOKIE
            }
        };

        request.get(options, (error, response, body) => {
            try {
                var objData = scrapeListData(error, body);
                return resolve(objData);
            } catch(e) {
                return reject(new Error(e.message));
            }
        });
    });
};
exports.getModel = function(url, id) {
    return new Promise((resolve, reject) => {
        console.log(url)
        var options = {
            url: url,
            method: 'GET',
            headers: {
                'User-Agent': settings.USER_AGENT,
                'Cookie': settings.COOKIE
            }
        };

        request.get(options, (error, response, body) => {
            try {
                var objData = scrapeData(error, body, id);
                return resolve(objData);
            } catch(e) {
                return reject(new Error(e.message));
            }
        });
    });
};


function scrapeListData(error, body) {
    if(error) {
        throw new Error(error.message);
    }
    if(body == null) {
        throw new Error('Body is empty');
    }

    try {
        var $ = cheerio.load(body);
        
        //#region Models 
        var models = [];
        var container = $('div#cb-content').find('div.cb-main').children('div.cb-grid-x');
        var divs = container.find('div.cb-grid-feature.cb-meta-style-2');
        divs.each(function(i, elem) {
            var div = $(this);
            var anchor_elem = div.find('div.cb-grid-img').find('a');
            var image = anchor_elem.find('img').attr('src');
            var model_name = div.find('div.cb-article-meta').find('h2 > a').text();
            var id = div.children('a.cb-link').attr('href').split('https://sexyclube.uol.com.br/')[1].replace('/', '');

            var objJson = {};
            objJson.id = id;
            objJson.name = model_name;
            objJson.thumb = image;
            models.push(objJson);
        });
        //#endregion

        //#region Pagination
        var div_pagination = $('div#cb-content').find('div.cb-main').children('div.cb-no-more-posts.cb-pagination-button.cb-infinite-load');
        var objPage = {};
        if(div_pagination.find('span').text().length > 0) {
            objPage.has_next_page = false;
        } else {
            objPage.has_next_page = true;
        }

        if(div_pagination.length == 0 && models.length > 0) {
            objPage.has_next_page = true;
        } else {
            objPage.has_next_page = false;
        }
        //#endregion
        
        var objData = {};
        objData.page_info = {};
        objData.models = [];
        objData.page_info = objPage;
        objData.models = models;

        console.log('[DATA]: ', objData)
        return objData;
    } catch(e) {
        throw new Error(e.message);
    }
}
function scrapeData(error, body, id) {
    if(error) {
        throw new Error(error.message);
    }
    if(body == null) {
        throw new Error('Body is empty');
    }

    try {
                
        var $ = cheerio.load(body);

        var container = $('section.cb-entry-content').find('span.cb-itemprop');
        
        //#region name, thumb, description, info
        var div_name = $('div.cb-entry-header.cb-meta').children('h1');
        var name = div_name.text();
        
        var thumb = '';
        var thumb_elem = $('div#cb-featured-image').children('div')
        thumb_elem.each(function(i, elem) {
            var div_elem = $(this);

            if(div_elem.attr('class').includes('cb-fis-bg', 0)) {
                if(div_elem.attr('style').length > 0) {
                    thumb = div_elem.attr('style').trim().split('background-image: url( ')[1].replace(');', '');
                }
            }
        });

        var description = '';
        container.find('h2').each(function(i, item) {
            var elem = $(this);
            if(i == 0) {
                description = elem.text();
            }
        });
        
        var texto_info = [];
        container.children('h4').each(function() {
            var d = $(this)
            texto_info.push(d.text())
        })
        var info = texto_info.join(' ')
        //#endregion

        //#region social medias
        var social_medias = '';
        var p_social_medias = container.children('p');
        p_social_medias.each(function(i, item) {
            var elem = $(this);

            if(elem.find('a').attr('rel') == 'noopener noreferrer') {
                var texto = elem.text();

                // if(!(texto.includes('Todas as informações e os conteúdos desta página foram fornecidos pela própria modelo') ||
                //      texto.includes('fotógrafo_ ') ||
                //      texto.includes('videomaker_ '))) {
                //     var text1 = texto.split('<br>');
                //     var text2 = text1[0].replace(/\n/g, ';').trim()
                //     social_medias = text2.split(';');
                // }
                if(texto.includes('instagram_') ||
                    texto.includes('facebook_') ||
                    texto.includes('e-mail_') ||
                    texto.includes('twitter_') ||
                    texto.includes('Cam Girl_') ||
                    texto.includes('site_') ||
                    texto.includes('youtube_')) {
                    var text1 = texto.split('<br>');
                    var text2 = text1[0].replace(/\n/g, ';').trim()
                    social_medias = text2.split(';');
                }


                
            }

            if(elem.text().includes('whatsapp_ ')) {
                social_medias.push(elem.text());
            }
        });
        //#endregion

        //#region photos
        var photos = [];
        var temFotos = container.children('h3').text().includes('FOTOS');

        if(temFotos) {
            var texto = container.children('h3').text();
            if(texto.includes('FOTOS GRÁTIS')) {
                
                container.children('div').each(function(i, item) {
                    
                    var id = $(this).attr('id')
        
                    if(id != undefined) {
                        
                        if(id.includes('gallery')) {
                            var div_elem = $(this);
                                var dl_elem = div_elem.children('dl');
                                dl_elem.each(function(i, item) {
                                    var elem = $(this)
                                    var image = elem.children('dt').find('img').attr('src');
                                    photos.push(image);
                                });
                        } else {
                            var p_img_elems = container.find('p').children('img');
                            p_img_elems.each(function(i, elem) {
                                var p_elem = $(this);
                                var image = p_elem.attr('src')
                                photos.push(image);
                            });
                        }
                    }                    
                });

                // quando as imagens estao dentro de uma unica p
                var p_img_elems = container.find('p').children('img');
                p_img_elems.each(function(i, elem) {
                    var p_elem = $(this);
                    var image = p_elem.attr('src')
                    photos.push(image);
                });


            } else {
                
                container.children('div').each(function(i, item){
                    var id = $(this).attr('id');
                    if(id != undefined) {
                        if(id.includes('gallery')) {
                            var div_elem = $(this);
                            var dl_elem = div_elem.children('dl');
                            dl_elem.each(function(i, item) {
                                var elem = $(this)
                                var image = elem.children('dt').find('img').attr('src');
                                photos.push(image);
                            });
                        }
                    }
                })


                var p_img_elems = container.find('p').children('img');
                p_img_elems.each(function(i, elem) {
                    var p_elem = $(this);
                    var image = p_elem.attr('src')
                    photos.push(image);
                });
            }
        } else {
            
            // Só tem apenas 1 div com a classe h_iframe, provavelmente ai dentro deve ter foto
            if(container.children('div').length == 1 && container.children('div').attr('class') == 'h_iframe') {
                
                var div_el = container.children('div').find('div');
                div_el.each(function(i, item) {
                    var elem = $(this);
                    var id = elem.attr('id')
                    if(id != undefined && id.includes('gallery')) {
                        var dl_elem = elem.children('dl');
                        dl_elem.each(function(i, item) {
                            var image = $(this).children('dt').find('img').attr('src');
                            photos.push(image);
                        });
                    }
                })
            }

            container.children('div').each(function(i, item) {
                
                var div_elem = $(this);
                var dl_elem = div_elem.children('dl');
                dl_elem.each(function(i, item) {
                    var elem = $(this)
                    var image = elem.children('dt').find('img').attr('src');
                    photos.push(image);
                });
            });
        }
        
        //#endregion


        //#region video
        var videos = [];
        var objVideo = {};
        var temVideo = $('div.h_iframe').children('iframe').attr('src');
        if(temVideo != undefined) {

            $('div.h_iframe').each(function(i, item) {
                var elem = $(this);
                var video = elem.children('iframe').attr('src');
                objVideo.thumb = null;
                objVideo.title = null;
                objVideo.description = null;
                objVideo.video = video;
                videos.push(objVideo);
            });
        } else {
            $('div.wp-video').each(function(i, item) {
                var elem = $(this);
                if(elem.text() != '') {
                    objVideo.thumb = elem.find('video').attr('poster');
                    objVideo.title = container.children('h1').text();
                    objVideo.description = description;
                    objVideo.video = elem.find('a').attr('href')
                    videos.push(objVideo);
                }
                
            })
        }
        //#endregion

        //#region curiosidades
        var curiosities = [];
        var p_elems = container.find('p');
        p_elems.each(function(i, elem) {
            var elem = $(this);
            if(elem.find('strong').text().includes('?')) {
                var objCurio = {};
                var split1 = elem.text().split('\n');
                objCurio.question = split1[0].trim();
                objCurio.answer = split1[1].trim();
                curiosities.push(objCurio);
            }
        });
        //#endregion
        
        var objData = {};
        objData.id = id;
        objData.name = name;
        objData.thumb = thumb;
        objData.info = info;
        objData.description = description;
        objData.social_medias = [];
        if(social_medias.length > 0) {
            objData.social_medias = social_medias;
        }
        
        objData.videos = videos;                                
        objData.photos = photos;
        objData.curiosities = curiosities;

        var objRetorno = {};
        objRetorno.models = [];
        objRetorno.models.push(objData); 

        return objRetorno;
    } catch(e) {
        throw new Error(e.message);
    }
}