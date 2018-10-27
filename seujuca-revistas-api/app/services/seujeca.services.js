var Promise = require('bluebird')
var cheerio = require('cheerio')
var request = require('request')
var settings = require('../../config/settings.json');

//#region Revistas
exports.getCategorias = function() {
    return new Promise((resolve, reject) => {
        var options = {
            url: settings.urls.base_url,
            headers: settings.request_headers
        };
        
        request.get(options, (error, response, body) => {
            try {
                var objData = scrapeListCategoriasData(error, body);
                return resolve(objData);
            } catch(e) {
                return reject(new Error(e.message));
            }
        })
    })
}
exports.getRevista = function(url, revista) {
    return new Promise((resolve, reject) => {
        var options = {
            url: url,
            headers: settings.request_headers
        };
        request.get(options, (error, response, body) => {
            try {
                var objData = scrapeRevistaData(error, body, revista);
                return resolve(objData);
            } catch(e) {
                return reject(new Error(e.message));
            }
        })
    })
}
exports.getRevistas = function(url, marca) {
    return new Promise((resolve, reject) => {
        var options = {
            url: url,
            headers: settings.request_headers
        };
        // https://www.seujeca.com/revista-sexy/page/2
        request.get(options, (error, response, body) => {
            try {
                var objData = scrapeListRevistasData(error, body, marca);
                return resolve(objData);
            } catch(e) {
                return reject(new Error(e.message));
            }
        })
    })
}

function scrapeListCategoriasData(error, body) {
    if(error) {
        throw new Error(error.message);
    }
    if(body == null) {
        throw new Error('Body is empty');
    }
    try {
        var $ = cheerio.load(body);
        var categorias = [];
        var categoriasContent = $('div.menu-menu-container').find('li#menu-item-25320').children('ul').find('li');
        categoriasContent.each(function(i, item) {
            var li_elem = $(this);
            var a_elem = li_elem.find('a');

            var objCategoria = {};
            objCategoria.id = a_elem.attr('href').split('https://www.seujeca.com/').pop().replace('/', '');
            objCategoria.title = a_elem.text();            
            categorias.push(objCategoria);
        });

        var objReturn = {};
        objReturn.categorias = categorias;

        return objReturn;
    } catch(e) {
        throw new Error(e.message);
    }
}
function scrapeRevistaData(error, body, id) {
    if(error) {
        throw new Error(error.message);
    }
    if(body == null) {
        throw new Error('Body is empty');
    }
    try {
        var $ = cheerio.load(body);

        //#region Verifica se existe a revista
        var has404Error = $('main#main').find('img.error-img').length > 0;
        if(has404Error) {
             throw new Error('Page not found');
            //throw new Error('HTTP Error: ' + response.statusCode + ' ' + response.statusMessage)
        }
        //#endregion

        //#region Title, Type (Marca)
        var tipo = $('div.entry-meta').find('span.cat-links').children('a').text()
        var dataPublicacao = $('div.entry-meta').find('span.posted-on').find('a').find('time.entry-date.published').attr('datetime').split('+').shift();
        var title = $('header.entry-header').children('h1').text();
        var titleArr = $('header.entry-header').children('h1').text().split(' :: ');
        var edition = titleArr[0];
        var model = titleArr[1];
        var marca = $('div.entry-meta').children('span.cat-links').find('a').text();
        var description = $('div.entry-content').children('h2').text();
        var thumb_capa = '';
        if($('div.entry-content').children('figure').length > 0) {
            thumb_capa = $('div.entry-content').children('figure').find('img').attr('src')
        } else {
            thumb_capa = $('div.entry-content').children('p.first-child').find('img').attr('src');
        }
        //#endregion

        //#region Photos
        var photos = [];
        var listPhotosContent = $('div.entry-content').children('p').find('img')            
        listPhotosContent.each(function(i, item) {
            var img = $(this);
            var imgSrc = img.attr('src');
            var src = imgSrc;
            if(!src.includes('seujeca.com')) {
                src = 'https://www.seujeca.com' + imgSrc;                
            }
            photos.push(src)
        });

        var has_figures = $('div.entry-content').children('figure').length > 0;
        if(has_figures) {
            var figures = $('div.entry-content').children('figure')
            figures.each(function(i, item) {
                var img = $(this);
                var imgSrc = img.find('img').attr('src');
                var src = imgSrc;
                if(!src.includes('seujeca.com')) {
                    src = 'https://www.seujeca.com' + imgSrc;                
                }
                photos.push(src)
            })
        }
        //#endregion

        var objReturn = {}
        objReturn.revista_id = id;
        objReturn.tipo = tipo;
        objReturn.dataPublicacao = dataPublicacao;
        objReturn.thumb_capa = thumb_capa;
        objReturn.model = model;
        objReturn.edition = edition;
        objReturn.title = title;
        objReturn.marca = marca;
        objReturn.description = description;
        objReturn.count = photos.length;
        objReturn.photos = photos;
        return objReturn;
    } catch(e) {
        throw new Error(e.message);
    }
}
function scrapeListRevistasData(error, body, tipo) {
    if(error) {
        throw new Error(error.message);
    }
    if(body == null) {
        throw new Error('Body is empty');
    }
    try {
        var $ = cheerio.load(body);


        //#region Paginação
        var nav = $('main#main').children('nav.navigation.pagination')
        var links = nav.children('div.nav-links')
        var hasNextPage = links.children('a.next.page-numbers').length > 0;
        var objPageInfo = {};
        objPageInfo.has_next_page = true;
        if(!hasNextPage) {
            objPageInfo.has_next_page = false;
        }

        // Page not found
        var hasNotFoundContent = $('main#main').children('section.error-404.not-found').length > 0;
        if(hasNotFoundContent) {
            throw new Error('Page not found');
        }
        //#endregion

        var revistas = [];
        var revistasContent = $('main#main').children('article');
        revistasContent.each(function(i, item) {
            var revista = $(this);
            
            var titleArr = revista.children('header').find('h2').text().split(' :: ');
            var title = revista.children('header').find('h2').text();
            var edition = titleArr[0];
            var model = titleArr[1];
            var marca = revista.children('div.entry-meta').children('span.cat-links').find('a').text()
            var description = revista.children('div.entry-content').children('h2').text();
            var thumb_capa = '';
            var dataPublicacao = revista.children('div.entry-meta').find('span.posted-on').find('a').find('time.entry-date.published').attr('datetime').split('+').shift();

            if(revista.children('div.entry-content').children('figure').length > 0) {
                thumb_capa = revista.children('div.entry-content').children('figure').find('img').attr('src');
            } else {
                thumb_capa = revista.children('div.entry-content').children('p').find('img').attr('src');
            }

            var id = revista.find('header.entry-header').children('h2').find('a').attr('href').split('https://www.seujeca.com/').pop().replace('/','')

            // se for retrospectiva
            if(title.includes('Retrospectiva')) {
                var table_td = $('div.entry-content').children('table').find('tr').find('td')
                table_td.each(function(i, item) {
                    var td_elem = $(this);
                    var td_id = td_elem.children('p').find('a').attr('href').split('https://bit.ly/')[1]; // https://bit.ly/suzy_cortez
                    var td_thumb_capa = td_elem.children('p').find('a').find('img').attr('src')
                    var td_title = td_elem.children('p')[1].children[0].data;
                    var strReplace = ' ' + getOnlyNumbers(title).toString() + ' - '
                    var custom_title = td_title.replace(' – ', strReplace).replace('–', '-')

                    var objRevista = {};
                    objRevista.revista_id = td_id;
                    objRevista.dataPublicacao = "";
                    objRevista.title = title;
                    objRevista.model = custom_title.split(' - ')[1];
                    objRevista.edition = tipo + ' - ' + custom_title.split(' - ')[0];
                    objRevista.marca = tipo;
                    objRevista.description = '';
                    objRevista.thumb_capa = td_thumb_capa;
                    objRevista.isBitLy = true;
                    revistas.push(objRevista);
                })
            } else {
                var objRevista = {};
                objRevista.revista_id = id;
                objRevista.dataPublicacao = dataPublicacao;
                objRevista.title = title;
                objRevista.model = model;
                objRevista.edition = edition;
                objRevista.marca = marca;
                objRevista.description = description;
                objRevista.thumb_capa = thumb_capa;
                objRevista.isBitLy = false;
                revistas.push(objRevista);
            }
        });

        var objReturn = {};
        objReturn.page_info = objPageInfo;
        objReturn.revistas = revistas;

        return objReturn;
    } catch(e) {
        throw new Error(e.message);
    }
}
//#endregion

//#region Famosas
exports.getFamosas = function(url) {
    return new Promise((resolve, reject) => {
        var options = {
            url: url,
            headers: settings.request_headers
        };
        // https://www.seujeca.com/mulheres/page/2
        request.get(options, (error, response, body) => {
            try {
                var objData = scrapeListFamosasData(error, body);
                return resolve(objData);
            } catch(e) {
                return reject(new Error(e.message));
            }
        })
    })
}
exports.getFamosa = function(famosa) {
    return new Promise((resolve, reject) => {
        if(!famosa){
            return reject(new Error('You must provide a famosa name'));
        }
        var url = `${settings.urls.base_url}/${famosa}/`;
        var options = {
            url: url,
            headers: settings.request_headers
        };
        request.get(options, (error, response, body) => {
            try {
                var objData = scrapeFamosaData(error, body, famosa);
                return resolve(objData);
            } catch(e) {
                return reject(new Error(e.message));
            }
        })
    })
}
//#endregion

//#region Caiu Na Net
exports.getListCaiuNaNet = function(url) {
    return new Promise((resolve, reject) => {
        var options = {
            url: url,
            headers: settings.request_headers
        };
        request.get(options, (error, response, body) => {
            try {
                var objData = scrapeListCaiuNaNetData(error, body);
                return resolve(objData);
            } catch(e) {
                return reject(new Error(e.message));
            }
        })
    })
}

function scrapeListCaiuNaNetData(error, body) {
    if(error) {
        throw new Error(error.message);
    }
    if(body == null) {
        throw new Error('Body is empty');
    }
    try {
        var $ = cheerio.load(body);

        //#region Paginação
        var nav = $('main#main').children('nav.navigation.pagination')
        var links = nav.children('div.nav-links')
        var hasNextPage = links.children('a.next.page-numbers').length > 0;
        var objPageInfo = {};
        objPageInfo.has_next_page = true;
        if(!hasNextPage) {
            objPageInfo.has_next_page = false;
        }

        // Page not found
        var hasNotFoundContent = $('main#main').children('section.error-404.not-found').length > 0;
        if(hasNotFoundContent) {
            throw new Error('Page not found');
        }
        //#endregion
        var mainContent = $('main#main').children('article');
        var vacilonas = [];
        mainContent.each(function(i, item) {
            var vacilona = $(this);
            var tipo = vacilona.children('div.entry-meta').find('span.cat-links').find('a').text();
            var dataPublicacao = vacilona.children('div.entry-meta').find('span.posted-on').find('a').find('time.entry-date.published').attr('datetime').split('+').shift();
            var id = vacilona.children('header').find('h2').find('a').attr('href').split('https://www.seujeca.com/').pop().replace('/', '');
            var title = vacilona.children('header').find('h2').text();
            var thumb = '';
            if(vacilona.children('div.entry-content').children('figure').length > 0) {
                thumb = vacilona.children('div.entry-content').children('figure').find('img').attr('src');
            }
            else if(vacilona.children('div.entry-content').children('h2').find('img').length > 0) {
                thumb = vacilona.children('div.entry-content').children('h2').find('img').attr('src')
            }
            else {
                thumb = vacilona.children('div.entry-content').children('p').find('img').attr('src');
            }

            var description = '';
            var h2_elems = vacilona.children('div.entry-content').children('h2');
            h2_elems.each(function(i, item) {
                var h2_elem = $(this)
                if(!h2_elem.find('img').length > 0) {
                    description = h2_elem.text();
                }
            });

            var objVacilonas = {};
            objVacilonas.famosa_id = id;
            objVacilonas.tipo = tipo;
            objVacilonas.dataPublicacao = dataPublicacao;
            objVacilonas.title = title;
            objVacilonas.thumb = thumb;
            objVacilonas.description = description;
            vacilonas.push(objVacilonas);
        });

        var objReturn = {};
        objReturn.page_info = objPageInfo;
        objReturn.vacilonas = vacilonas;
        return objReturn;
    } catch(e) {
        throw new Error(e.message);
    }
}
//#endregion

//#region Download

//#endregion

function scrapeListFamosasData(error, body) {
    if(error) {
        throw new Error(error.message);
    }
    if(body == null) {
        throw new Error('Body is empty');
    }
    try {
        var $ = cheerio.load(body);

        //#region Paginação
        var nav = $('main#main').children('nav.navigation.pagination')
        var links = nav.children('div.nav-links')
        var hasNextPage = links.children('a.next.page-numbers').length > 0;
        var objPageInfo = {};
        objPageInfo.has_next_page = true;
        if(!hasNextPage) {
            objPageInfo.has_next_page = false;
        }

        // Page not found
        var hasNotFoundContent = $('main#main').children('section.error-404.not-found').length > 0;
        if(hasNotFoundContent) {
            throw new Error('Page not found');
        }
        //#endregion

        var mainContent = $('main#main').children('article');
        var famosas = [];
        mainContent.each(function(i, item) {
            var famosa = $(this);

            var tipo = famosa.children('div.entry-meta').find('span.cat-links').find('a').text();
            var dataPublicacao = famosa.children('div.entry-meta').find('span.posted-on').find('a').find('time.entry-date.published').attr('datetime').split('+').shift();
            var title = famosa.children('header').find('h2').text();
            var thumb = '';
            if(famosa.children('div.entry-content').children('figure').length > 0) {
                thumb = famosa.children('div.entry-content').children('figure').find('img').attr('src');
            }
            else if(famosa.children('div.entry-content').children('h2').find('img').length > 0) {
                thumb = famosa.children('div.entry-content').children('h2').find('img').attr('src')
            }
            else {
                thumb = famosa.children('div.entry-content').children('p').find('img').attr('src');
            }

            var description = '';
            var h2_elems = famosa.children('div.entry-content').children('h2');
            h2_elems.each(function(i, item) {
                var h2_elem = $(this)
                if(!h2_elem.find('img').length > 0) {
                    description = h2_elem.text();
                }
            });
            
            var id = famosa.children('header').find('h2.entry-title').find('a').attr('href').split('https://www.seujeca.com/').pop().replace('/','')

            var objFamosas = {};
            objFamosas.famosa_id = id;
            objFamosas.tipo = tipo;
            objFamosas.dataPublicacao = dataPublicacao;
            objFamosas.title = title;
            objFamosas.thumb = thumb;
            objFamosas.description = description;
            famosas.push(objFamosas);
        });        

        var objReturn = {};
        objReturn.page_info = objPageInfo;
        objReturn.famosas = famosas;
        return objReturn;
    } catch(e) {
        throw new Error(e.message);
    }
}
function scrapeFamosaData(error, body, id) {
    if(error) {
        throw new Error(error.message);
    }
    if(body == null) {
        throw new Error('Body is empty');
    }
    try {
        var $ = cheerio.load(body);

        var thumb = ''
        if($('div.entry-content').children('figure').length > 0) {
            thumb = $('div.entry-content').children('figure').find('img').attr('src');
        }
        else if($('div.entry-content').children('h2').find('img').length > 0) {
            thumb = $('div.entry-content').children('h2').find('img').attr('src')
        }
        else {
            thumb = $('div.entry-content').children('p').find('img').attr('src');
        }

        var tipo = $('div.entry-meta').find('span.cat-links').find('a').text();
        var dataPublicacao = $('div.entry-meta').find('span.posted-on').find('a').find('time.entry-date.published').attr('datetime').split('+').shift();
        var description = $('div.entry-content').children('h2').text();
        
        var photos = [];
        if($('main#main').children('article').length > 0) {
            var articles = $('main#main').children('article');
            articles.each(function(i, item) {
                var article = $(this);
                var p_elems = article.find('div.entry-content').find('p');
                p_elems.each(function(i, item) {
                    var p_elem = $(this)
                    if(p_elem.find('img').length > 0) {
                        var img = p_elem.find('img').attr('src')
                        if(!img.includes('seujeca.com')) {
                            img = 'https://www.seujeca.com' + img;                
                        }
                        photos.push(img)
                    }
                })
            })
        } else {
            var p_elems = $('div.entry-content').children('p');
            
            p_elems.each(function(i, item) {
                var p_elem = $(this);
                if(p_elem.find('img').length > 0) {
                    var photo = p_elem.find('img').attr('src');
                    if(!photo.includes('seujeca.com')) {
                        photo = 'https://www.seujeca.com' + photo;                
                    }
                    photos.push(photo);
                }
            });
        }

        var videos = [];
        var has_iframes = $('div.entry-content').find('iframe').length > 0;
        if(has_iframes) {
            var iframes_elems = $('div.entry-content').find('iframe');
            iframes_elems.each(function(i, item) {
                var iframe = $(this);
                videos.push(iframe.attr('src'));
            })
        }
        
        var objReturn = {};
        objReturn.famosa_id = id;
        objReturn.tipo = tipo;
        objReturn.dataPublicacao = dataPublicacao;
        objReturn.thumb = thumb;
        objReturn.description = description;
        objReturn.photos = photos;
        objReturn.videos = videos;
        
        return objReturn;
    } catch(e) {
        throw new Error(e.message);
    }
}

var getOnlyNumbers = function(str) {
    var regex = /\d+/g;
    if(str.length == 0) {
        return 1;
    }    
    return str.match(regex)[0];
}
//#region  Refs
// https://www.gostosashd.blog.br/revista-sexy/bia-dominguez-nua-sexy-de-dezembro-de-2017/
// https://www.baixedetudo.net/revistas/revistas-xxx
// https://www.seujeca.com/revista-sexy/
//#endregion
