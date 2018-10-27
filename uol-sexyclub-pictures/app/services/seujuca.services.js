var Promise = require('bluebird')
var cheerio = require('cheerio')
var request = require('request')
var fs = require('fs')

var cookie = '__cfduid=d9957998adb0d67b5fb892cfe1cb9be511539891213; _ga=GA1.2.1384250418.1539891219; _gid=GA1.2.584515628.1539891219';
var userAgent = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/69.0.3497.100 Safari/537.36';

// https://www.seujeca.com/revista-sexy-dezembro-bia-dominguez/
exports.getPhotos = function(revista) {
    return new Promise((resolve, reject) => {
        if(!revista){
            return reject(new Error('You must provide a revista name'));
        }

        var url = `https://www.seujeca.com/${revista}/`;
        var options = {
            url: url,
            headers: {
                'Cookie': cookie,
                'User-Agent': userAgent
            }
        };
        request.get(options, (error, response, body) => {
            try {
                var objData = scrapeListPhotosData(error, body, revista);
                return resolve(objData);
            } catch(e) {
                return reject(new Error(e.message));
            }
        })
    })
}

// https://www.seujeca.com/revista-sexy/page/2
exports.getRevistas = function(url) {
    return new Promise((resolve, reject) => {
        var options = {
            url: url,
            headers: {
                'Cookie': cookie,
                'User-Agent': userAgent
            }
        };
        request.get(options, (error, response, body) => {
            try {
                var objData = scrapeListRevistasData(error, body);
                return resolve(objData);
            } catch(e) {
                return reject(new Error(e.message));
            }
        })
    })
}


function scrapeListPhotosData(error, body, id) {
    if(error) {
        throw new Error(error.message);
    }
    if(body == null) {
        throw new Error('Body is empty');
    }
    try {
        var $ = cheerio.load(body);

        //#region Title, Type (Marca)
        var title = $('header.entry-header').children('h1').text();
        var titleArr = $('header.entry-header').children('h1').text().split(' :: ');
        var edition = titleArr[0];
        var model = titleArr[1];
        var marca = $('div.entry-meta').children('span.cat-links').find('a').text();
        //#endregion

        //#region Photos
        var listPhotosContent = $('div.entry-content').children('p').find('img')
        var photos = [];
        listPhotosContent.each(function(i, item) {
            var img = $(this);
            var imgSrc = img.attr('src');
            var src = imgSrc;
            if(!src.includes('https://www.seujeca.com')) {
                src = 'https://www.seujeca.com' + imgSrc;                
            }
            photos.push(src)
        });
        //#endregion

        var objReturn = {}
        objReturn.id = id;
        objReturn.model = model;
        objReturn.edition = edition;
        objReturn.title = title;
        objReturn.marca = marca;
        objReturn.count = photos.length;
        objReturn.photos = photos;
        return objReturn;
    } catch(e) {
        throw new Error(e.message);
    }
}

function scrapeListRevistasData(error, body) {
    if(error) {
        throw new Error(error.message);
    }
    if(body == null) {
        throw new Error('Body is empty');
    }
    try {
        var $ = cheerio.load(body);

        var revistasContent = $('main#main').children('article');
        revistasContent.each(function(i, item) {
            var revista = $(this);

            //#region Title, Type (Marca)
            var title = $('header.entry-header').children('h1').text();
            var titleArr = $('header.entry-header').children('h1').text().split(' :: ');
            var edition = titleArr[0];
            var model = titleArr[1];
            var marca = $('div.entry-meta').children('span.cat-links').find('a').text();
            var id = '';
            var description = '';
            var thumb_capa = '';
            //#endregion


        })
/*
        

        //#region Photos
        var listPhotosContent = $('div.entry-content').children('p').find('img')
        var photos = [];
        listPhotosContent.each(function(i, item) {
            var img = $(this);
            var imgSrc = img.attr('src');
            var src = imgSrc;
            if(!src.includes('https://www.seujeca.com')) {
                src = 'https://www.seujeca.com' + imgSrc;                
            }
            photos.push(src)
        });
        //#endregion
        

        var objReturn = {}
        objReturn.id = id;
        objReturn.model = model;
        objReturn.edition = edition;
        objReturn.title = title;
        objReturn.marca = marca;
        objReturn.description = description;
        objReturn.thumb_capa = thumb_capa;
        */
        return null;
    } catch(e) {
        throw new Error(e.message);
    }
}



// https://www.gostosashd.blog.br/revista-sexy/bia-dominguez-nua-sexy-de-dezembro-de-2017/
// https://www.baixedetudo.net/revistas/revistas-xxx
// https://www.seujeca.com/revista-sexy/