var express = require('express');
var router = express.Router();
var InstagramService = require('../services/instagram.service');
var settings = require('../../config/app.settings');

router.get('/downloadFotos', (req, res, next) => {
    var pathDir = req.query.pathDir;
    var mediaUrl = req.query.urlMedia;
    var filename = req.query.filename;

    var json = {
        pathDir: pathDir, mediaUrl: mediaUrl, filename: filename
    };
    console.log(json);

    InstagramService.saveMedias(mediaUrl, pathDir, filename)
        .then((data) => {
            console.log(data);
            res.status(200).json(data);
        })
        .catch(err => {
            var jsonObj = {};
            jsonObj.filename = filename;
            jsonObj.message = 'Erro ao tentar salvar as medias';
            res.status(400).json(jsonObj);
        });
    //res.status(200).json({ msg: 'Sucesso'});
})



router.get('/v2/downloadFotos', (req, res, next) => {
    // var data = req.query.medias;
    // var username = req.query.username;
    // var mediasUrl = JSON.parse(data);

    // cria o diretorio se ele não existir
    // var pathDir = `${settings.pathToSave}/${username}`;
    // InstagramService.checkDirectorySync(pathDir);
    
    // mediasUrl.forEach(mediaUrl => {
    //     var filename = getFilename(mediaUrl.url);

    //     // InstagramService.saveMedias(mediaUrl, pathDir, filename)
    //     //     .then((data) => { 
    //     //         console.log(data);
    //     //     })
    //     //     .catch(err => res.status(400).json({ message: 'Erro ao tentar salvar as medias' }));            
    // });

    var pathDir = req.query.pathDir;
    var mediaUrl = req.query.urlMedia;
    var filename = req.query.filename;

    InstagramService.saveMedias(mediaUrl, pathDir, filename)
        .then((data) => {
            
        })
        .catch(err => {
            var jsonObj = {};
            jsonObj.filename = filename;
            jsonObj.message = 'Erro ao tentar salvar as medias';
            res.status(400).json(jsonObj);
        });
    
    //res.status(200).json({ status:'OK', data: { message: 'Media salva com sucesso'} });
})


function getFilename(mediaUrl)
{
    var urlFile = mediaUrl.split('https://scontent-gru2-2.cdninstagram.com/vp/')[1];    
    var filename = '';
    if (mediaUrl.indexOf('?') > 0)
    {
        var split1 = urlFile.split('?');
        var splitUrl = split1[0];
        var url = splitUrl.split('/');

        var arrayLength = url.length;
        for (var i = 0; i < arrayLength; i++) {
            if (url[i].indexOf(".mp4") > 0 || url[i].indexOf(".jpg") > 0)
            {
                filename = url[i];
            }
        }
    }
    else
    {
        var url = urlFile.split('/');
        var arrayLength = url.length;
        for (var i = 0; i < arrayLength; i++) {
            if (url[i].indexOf(".mp4") > 0 || url[i].indexOf(".jpg") > 0)
            {
                filename = url[i];
            }
        }
    }

    return filename;
}

module.exports = router;

// katyaelisehenry
