var request = require('request');
var Promise = require('bluebird');
var settings = require('../../config/appSettings.json');
var appScripts = require('../../config/app-scripts')
var cheerio = require('cheerio')

//#region Pornstar
module.exports.getPornstars = function(url) {
    return new Promise((resolve, reject) => {
        var options = {
            url: url,
            headers: settings.request_headers
        }

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
module.exports.getPornstarInfo = function(url) {
    return new Promise((resolve, reject) => {
        var options = {
            url: url,
            headers: settings.request_headers
        }

        request.get(options, (error, response, body) => {
            try {
                var objData = scrapePornstar(error, body, url);
                return resolve(objData);
            } catch(e) {
                return reject(new Error(e.message));
            }
        })
    })
}
module.exports.getPornstarEnsaio = function(url) {
    return new Promise((resolve, reject) => {
        var options = {
            url: url,
            headers: settings.request_headers
        }

        request.get(options, (error, response, body) => {
            try {
                var objData = scrapePornstarEnsaio(error, body);
                return resolve(objData);
            } catch(e) {
                return reject(new Error(e.message));
            }
        })
    })
}
module.exports.getPornstarFilmografia = function(url) {
    return new Promise((resolve, reject) => {
        var options = {
            url: url,
            headers: settings.request_headers
        }

        request.get(options, (error, response, body) => {
            try {
                var objData = scrapePornstarFilmografia(error, body);
                return resolve(objData);
            } catch(e) {
                return reject(new Error(e.message));
            }
        })
    })
}
module.exports.getPornstarVideos = function(url) {
    return new Promise((resolve, reject) => {
        var options = {
            url: url,
            headers: settings.request_headers
        }

        request.get(options, (error, response, body) => {
            try {
                var objData = scrapePornstarVideos(error, body);
                return resolve(objData);
            } catch(e) {
                return reject(new Error(e.message));
            }
        })
    })
}
module.exports.getWallpapers = function(url) {
    return new Promise((resolve, reject) => {
        var options = {
            url: url,
            headers: settings.request_headers
        }

        request.get(options, (error, response, body) => {
            try {
                var objData = scrapeWallpapers(error, body);
                return resolve(objData);
            } catch(e) {
                return reject(new Error(e.message));
            }
        })
    }) 
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

        //#region Paginacao
        var objPage = {}
        objPage.has_next_page = false;
        if($('div.paginacao').length > 0) {
            objPage.has_next_page = true;            
        }
        else {
            throw new Error('Page not found')
        }
        //#endregion

        //#region Conteudo
        var regExp = /\(([^)]+)\)/;
        var matches = regExp.exec($('div.tit').children('div.statusPornstars').find('span').text());
        var count = (matches[1] - appScripts.mensCount())
        
        var pornstars = [];
        var content = $('div.conteudo').children('div')
        content.each(function(i, item) {
            var ps = $(this)            
            var name = ps.find('h3').find('a').text().trim()

            if(!appScripts.isMan(name)) {
                var obj = {}
                obj.id = ps.children('a').attr('href').split('/pornstars/perfil/').pop()                
                obj.name = name
                obj.thumb = ps.find('img').attr('src')
                pornstars.push(obj)
            }
        })      
        //#endregion

        var objReturn = {};
        objReturn.page_info = objPage
        objReturn.count = count
        objReturn.pornstars = pornstars;

        return objReturn;
    } catch(e) {
        throw new Error(e.message);
    }
}
function scrapePornstar(error, body, url) {
    if(error) {
        throw new Error(error.message);
    }
    if(body == null) {
        throw new Error('Body is empty');
    }
    try {
        var $ = cheerio.load(body);
        var id = url.split('https://www.brasileirinhas.com.br/pornstars/perfil/').pop()
        var name = $('div.titulo').children('h1').find('a').text();
        var img = $('div#imagem').find('img').attr('src')
        
        var about = '';
        $('div#informacao').children('div').each(function(i, item) {
            if(i == 0) {
                var info = $(this)
                about = info.text().trim().replace(/(\r\n\t|\n|\r\t)/gm, ' ')
            }
        })

        // tem links
        var links = [];
        if($('div#informacao').children('div').find('ul').length > 0) {
            $('div#informacao').children('div').find('ul').children('li').each(function(i, item) {
                var li_elem = $(this)
                var obj = {}
                var a_elem = li_elem.find('a').attr('href')
                if(a_elem != undefined) {
                    if(a_elem.includes('ensaio')) {
                        obj.ensaio = a_elem
                    } else if(a_elem.includes('videos')) {
                        obj.videos = a_elem
                    }
                    about = about.replace(li_elem.find('a').text(), '')
                    links.push(obj);
                }
            })
        }

        var views = $('div#informacao').children('div#sobreMais').find('span.visualizacao').text().split(' visualizações').shift()
        var nota = $('div#informacao').children('div#sobreMais').find('span.nota').text().split('Nota:').pop().trim()
        var votos = $('div#informacao').children('div#sobreMais').find('span.votos').text().split('Votos:').pop().trim()
        var ensaios = [];
        if($('div#fotos').children('a').length > 0) {
            $('div#fotos').children('a').each(function(i, item) {
                var elem_a = $(this)
                var obj = {}
                obj.ensaio_id = elem_a.attr('href')
                obj.img_capa = elem_a.find('img').attr('src')
                ensaios.push(obj)
            }) 
        }        
        
        var filmografia = []
        if($('div#filmografia').children('a').length > 0) {
            $('div#filmografia').children('a').each(function(i, item) {
                var elem_a = $(this)
                var obj = {}
                obj.filme_id = elem_a.attr('href')
                obj.title = elem_a.attr('title')
                obj.img_capa = elem_a.find('img').attr('src')
                filmografia.push(obj)
            }) 
        }
//sc_ls

        var cenas = [];        
        if($('div.conteudo').children('div.videosListagemItem').length > 0) {            
            $('div.conteudo').children('div.videosListagemItem').each(function(i, item) {
                var div_elem = $(this)
                if(div_elem.is('div')) {
                    var obj = {}
                    obj.title = div_elem.find('h3').find('a').attr('title')
                    obj.img = div_elem.find('a').find('img').attr('src')
                    obj.link = div_elem.find('a').attr('href')
                    obj.description = div_elem.children('p').find('strong').text()
                    obj.num_cena = div_elem.find('span')[0].children[0].data.split('cena ').pop().trim()                    
                    cenas.push(obj)                    
                }
            })            
        } 

        if($('div#cenas').children('div.conteudo').children('strong').length > 0) {
            $('div#cenas').children('div.conteudo').children('strong').each(function(i, item) {
                var strong_elem = $(this)
                strong_elem.children('div.videosListagemItem').each(function(i, item) {
                    var div_elem = $(this)
                    var obj = {}
                    obj.title = div_elem.find('h3').find('a').attr('title')
                    obj.img = div_elem.find('a').find('img').attr('src')
                    obj.link = div_elem.find('a').attr('href')
                    obj.description = div_elem.children('p').find('strong').text()
                    obj.num_cena = div_elem.find('span')[0].children[0].data.split('cena ').pop().trim()                    
                    cenas.push(obj)
                })
            })
        }
        
        var objReturn = {}
        objReturn.id = id
        objReturn.name = name 
        objReturn.thumb = img
        objReturn.info = about
        objReturn.views = views
        objReturn.nota = nota
        objReturn.votos = votos
        objReturn.ensaios = ensaios
        objReturn.filmografia = filmografia
        objReturn.cenas = cenas
        objReturn.links = links

        return objReturn;
    } catch(e) {
        throw new Error(e.message);
    }
}
function scrapePornstarEnsaio(error, body) {
    if(error) {
        throw new Error(error.message);
    }
    if(body == null) {
        throw new Error('Body is empty');
    }
    try {
        var $ = cheerio.load(body);
        var id = $('div.titulo').children('h1').find('a').attr('href')
        var name = $('div.titulo').children('h1').find('a').attr('title')
        var fotos = []
        fotos.push($('div#imagem').find('img').attr('src'))
        $('div#informacaoGarota').children('div#fotos').find('a').each(function(i, item) {
            var foto_elem = $(this)
            var foto = foto_elem.attr('href')
            fotos.push(foto)
        })

        var objReturn = {}
        objReturn.id = id
        objReturn.name = name
        objReturn.count = fotos.length
        objReturn.fotos = fotos
        return objReturn;
    } catch(e) {
        throw new Error(e.message);
    }
}
function scrapePornstarFilmografia(error, body) {
    if(error) {
        throw new Error(error.message);
    }
    if(body == null) {
        throw new Error('Body is empty');
    }
    try {
        var $ = cheerio.load(body);
        var id = $('div.titulo').children('h1').find('a').attr('href')
        var name = $('div.titulo').children('h1').find('a').attr('title')
        var filmografias = []
        $('div#ensaio').children('div.itemFilme').each(function(i, item) {
            var div_elem = $(this)
            var obj = {}
            obj.id = div_elem.find('a').attr('href')
            obj.title = div_elem.find('a').attr('title')
            obj.thumb = div_elem.find('a').find('img').attr('src')
            obj.description = div_elem.find('div.descricao').find('p').text().trim()
            filmografias.push(obj)
        })

        var objReturn = {}
        objReturn.id = id
        objReturn.name = name
        objReturn.count = filmografias.length
        objReturn.filmografias = filmografias
        return objReturn;
        
    } catch(e) {
        throw new Error(e.message);
    }
}
function scrapePornstarVideos(error, body) {
    if(error) {
        throw new Error(error.message);
    }
    if(body == null) {
        throw new Error('Body is empty');
    }
    try {
        var $ = cheerio.load(body);
        var id = $('div.titulo').children('h1').find('a').attr('href')
        var name = $('div.titulo').children('h1').find('a').attr('title')
        var videos = []
        $('div#ensaio').children('div.itemFilmeVideos').each(function(i, item) {
            var div_elem = $(this)
            var obj = {}
            obj.id = div_elem.find('a').attr('href')
            obj.title = div_elem.find('a').attr('title')
            obj.thumb = div_elem.find('a').find('img').attr('src')
            obj.description = div_elem.find('div.descricaoVideos').find('p').text().trim()
            videos.push(obj)
        })

        var objReturn = {}
        objReturn.id = id
        objReturn.name = name
        objReturn.count = videos.length
        objReturn.videos = videos
        return objReturn;
        
    } catch(e) {
        throw new Error(e.message);
    }
}
function scrapeWallpapers(error, body) {
    if(error) {
        throw new Error(error.message);
    }
    if(body == null) {
        throw new Error('Body is empty');
    }
    try {
        var $ = cheerio.load(body);

        //#region Paginacao
        var objPage = {}
        objPage.has_next_page = false;
        if($('div.paginacao').length > 0) {
            objPage.has_next_page = true;            
        }
        else {
            throw new Error('Page not found')
        }
        //#endregion
        
        //#region Conteudo
        var wallpapers = []
        $('div.conteudo').children('div.itemWallpaper').each(function(i, item) {
            var div_elem = $(this)

            var dimensions = []
            div_elem.children('div.descricaoWallpaper').find('p').each(function(i, item) {
                var p_elem = $(this)
                var objDimensions = {}
                var _width = p_elem.find('a').text().split('x')[0]
                var _height = p_elem.find('a').text().split('x')[1]
                objDimensions.width = _width
                objDimensions.height = _height
                objDimensions.img = `https://www.brasileirinhas.com.br${p_elem.find('a').attr('href')}`
                dimensions.push(objDimensions)
            })

            var obj = {}
            obj.thumb = div_elem.find('img').attr('src')
            obj.dimensions = dimensions
            wallpapers.push(obj)
        })
        //#endregion
        
        var objReturn = {};
        objReturn.page_info = objPage
        objReturn.wallpapers = wallpapers

        return objReturn;
    } catch(e) {
        throw new Error(e.message);
    }
}
//#endregion

//#region Ensaios
module.exports.getEnsaios = function(url) {
    return new Promise((resolve, reject) => {
        var options = {
            url: url,
            headers: settings.request_headers
        }

        request.get(options, (error, response, body) => {
            try {
                var objData = scrapeEnsaiosList(error, body);
                return resolve(objData);
            } catch(e) {
                return reject(new Error(e.message));
            }
        })
    })
}

function scrapeEnsaiosList(error, body) {
    if(error) {
        throw new Error(error.message);
    }
    if(body == null) {
        throw new Error('Body is empty');
    }
    try {
        var $ = cheerio.load(body);

        //#region Paginacao
        var objPage = {}
        objPage.has_next_page = false;
        if($('div.paginacao').length > 0) {
            objPage.has_next_page = true;            
        }
        else {
            throw new Error('Page not found')
        }
        //#endregion

        //#region Conteudo
        var regExp = /\(([^)]+)\)/;
        var matches = regExp.exec($('div.tit').children('div.statusPornstars').find('span').text());
        var count = matches[1]
        
        var ensaios = [];
        var content = $('div.conteudo').children('div.pornstar_perfil')
        content.each(function(i, item) {
            var div_elem = $(this)            
            var obj = {}
            obj.id = div_elem.find('h3').find('a').attr('href')
            obj.name = div_elem.find('h3').find('a').text().trim()
            obj.thumb = div_elem.children('a').find('img').attr('src')

            ensaios.push(obj);
        })      
        //#endregion

        var objReturn = {};
        objReturn.page_info = objPage
        objReturn.count = count
        objReturn.ensaios = ensaios;

        return objReturn;
    } catch(e) {
        throw new Error(e.message);
    }
}
//#endregion

//#region Filmes
module.exports.getFilmes = function(url) {
    return new Promise((resolve, reject) => {
        var options = {
            url: url,
            headers: settings.request_headers
        }

        request.get(options, (error, response, body) => {
            try {
                var objData = scrapeFilmesList(error, body);
                return resolve(objData);
            } catch(e) {
                return reject(new Error(e.message));
            }
        })
    })
}
module.exports.getFilmeInfo = function(url) {
    return new Promise((resolve, reject) => {
        var options = {
            url: url,
            headers: settings.request_headers
        }

        request.get(options, (error, response, body) => {
            try {
                var objData = scrapeFilme(error, body);
                return resolve(objData);
            } catch(e) {
                return reject(new Error(e.message));
            }
        })
    })
}

function scrapeFilmesList(error, body) {
    if(error) {
        throw new Error(error.message);
    }
    if(body == null) {
        throw new Error('Body is empty');
    }
    try {
        var $ = cheerio.load(body);

        //#region Paginacao
        var objPage = {}
        objPage.has_next_page = false;
        if($('div.paginacao').length > 0) {
            objPage.has_next_page = true;            
        }
        else {
            throw new Error('Page not found')
        }
        //#endregion

        //#region Conteudo
        var filmes = [];
        var content = $('div.conteudo').children('div.itemFilme')
        content.each(function(i, item) {
            var div_elem = $(this) 

            var obj = {}
            obj.id = div_elem.find('h3').find('a').attr('href')
            obj.name = div_elem.find('h3').find('a').text().trim()
            obj.thumb = div_elem.children('a').find('img').attr('src')

            filmes.push(obj)
        })      
        //#endregion

        var objReturn = {};
        objReturn.page_info = objPage
        objReturn.filmes = filmes;

        return objReturn;
    } catch(e) {
        throw new Error(e.message);
    }
}
function scrapeFilme(error, body) {
    if(error) {
        throw new Error(error.message);
    }
    if(body == null) {
        throw new Error('Body is empty');
    }
    try {
        var $ = cheerio.load(body);
        
        var name = $('div.titulo').find('h1').text()        
        
        var images = [];
        $('div#imagem').children('div.grande').find('a').each(function(i, item) {
            images.push($(this).attr('href'))
        })

        var info = $('div#conteudo').children('div#informacao').find('div').text()
        var duration = ''        
        var elenco = []
        var categories = []
        var cenas = []
        var fotos = []
        var relacionados = []

        $('div#conteudo').children('div#informacao').children('span').each(function(i, item) {
            var span_elem = $(this)

            if(span_elem.text().includes('Duração:')) {
                var duracao = span_elem.text().trim()
                duration = duracao.split('Duração: ').pop()
            } else if(span_elem.text().includes('Elenco:')) {
                span_elem.children('a').each(function(i, item) {
                    var a_elem = $(this)
                    var name = a_elem.text().trim()
                    if(!appScripts.isMan(name)) { 
                        var obj = {}
                        obj.id = a_elem.attr('href')
                        obj.name = name
                        elenco.push(obj)
                    }                    
                })
            } 
            // else if(span_elem.text().includes('Categorias:')) {

            // }
        })

        // cenas
        if($('div.foto').children('div.cena').length > 0) {
            $('div.foto').children('div.cena').each(function(i, item) {
                var div_elem = $(this)

                var obj = {}
                obj.id = div_elem.children('div').find('a').attr('href')
                obj.thumb = div_elem.children('div').find('a').find('img').attr('src')
                obj.title = div_elem.children('div').find('a').attr('title')
                obj.num_cena = div_elem.children('div').find('div').find('span').text().split('cena ').pop().trim()
                cenas.push(obj)
            })
        }

        // fotos
        if($('div.foto').children('a').length > 0) {
            $('div.foto').children('a').each(function(i, item) {
                var a_elem = $(this)                
                fotos.push(a_elem.attr('href'))
            })
        }

        // relacionados
        if($('div#FilmesRelacionados').children('div#FilmesRelacionados_internas').find('a').length > 0) {
            $('div#FilmesRelacionados').children('div#FilmesRelacionados_internas').find('a').each(function(i, item) {
                var a_elem = $(this)
                // somente 6
                if(i < 6) {
                    var obj = {}
                    obj.id = a_elem.attr('href')
                    obj.thumb = a_elem.find('img').attr('src')
                    obj.title = a_elem.find('img').attr('alt').trim()
                    relacionados.push(obj)
                }
            })            
        }

        var objReturn = {}
        objReturn.name = name
        objReturn.images = images
        objReturn.info = info
        objReturn.duration = duration
        objReturn.elenco = elenco
        objReturn.cenas = cenas
        objReturn.fotos = fotos
        objReturn.relacionados = relacionados
        objReturn.categories = categories        

        return objReturn;
    } catch(e) {
        throw new Error(e.message);
    }
}
//#endregion
