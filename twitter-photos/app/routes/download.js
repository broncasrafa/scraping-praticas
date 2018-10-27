var express = require('express');
var router = express.Router();
var fs = require('fs');
var request = require('request');
var Promise = require('bluebird');
var appSettings = require('../../config/appsettings.json');

router.get('/:screen_name', (req, res) => {
    var medias = req.query.medias;
    var username = req.params.screen_name;
    var mediasUrl = JSON.parse(medias)
    var pathDir = `${appSettings.settings.pathDir}/${username}`;

    // cria o diretorio se ele não existir
    checkDirectorySync(pathDir);

    mediasUrl.forEach(mediaUrl => {

        var filename = '';

        var split_url = mediaUrl.split('/')
        filename = split_url.pop();
        console.log({ url: mediaUrl, filename: filename});

        saveMedias(mediaUrl, pathDir, filename)
            .then((data) => {

            })
            .catch(err => res.status(400).json({ message: 'Erro ao tentar salvar as medias' }))
    });

    res.status(200).json({data: 'sucesso'});
})


function checkDirectorySync (directory) {
    try {
        fs.statSync(directory);
    } catch(e) {
        fs.mkdirSync(directory);
    }
}

function saveMedias (mediaUrl, saveTo, filename) {
    return new Promise((resolve, reject) => {
        if (!mediaUrl) {
            return reject(new Error('Argument "mediaUrl" must be specified'));
        }

        var options = {
            url: mediaUrl,
            method: 'GET',
            encoding: 'binary',
            rejectUnauthorized: false
        }

        request(options, (error, response, body) => {
            // new Error('JSON parseError with HTTP Status: ' + response.statusCode + ' ' + response.statusMessage)
            // new Error('HTTP Error: ' + response.statusCode + ' ' + response.statusMessage)
            if(filename.includes('.mp4')) {
                filename = filename.split('?tag=')[0];
            }

            var path = `${saveTo}/${filename}`;
            fs.writeFile(path, body, 'binary', (err) => {
                if(err) {
                    console.log('Erro ao tentar salvar a media: ', err);
                    return reject(new Error('Erro ao tentar salvar a media'));
                }

                return resolve({ status:'OK', data: { message: 'Media salva com sucesso'} });
            })
        });
    })

}

module.exports = router;