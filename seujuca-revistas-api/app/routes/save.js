var express = require('express');
var router = express.Router();
var service = require('../services/seujeca.services')
var Revista = require('../models/revistas')
var Mulher = require('../models/mulheres')
var fs = require('fs')
var settings = require('../../config/settings.json')

//#region Salvar Revistas
router.get('/revistas/:revista', (req, res) => {
    var revista = req.params.revista;

    if(!revista){        
        res.status(400).json({ status: 'ERROR', errors: 'You must provide a revista name', data: {}});
    }

    var url = `${settings.urls.base_url}/${revista}/`;

    service.getRevista(url, revista)
        .then(function(result) {                        
            Revista.collection.insertOne(result, function(err, docs) {
                if(err) {
                    res.status(400).json({ status: 'ERROR', errors: 'Erro ao salvar registros: ' + err.message, data: {}});
                }

                res.status(200).json({ status: 'OK', errors: {}, data: result });
            })
        })
        .catch(err => {
            res.status(400).json({ status: 'ERROR', errors: err.message, data: {}});
        });
});
router.get('/bitly/:revista', (req, res) => {
    var revista = req.params.revista;

    if(!revista){        
        res.status(400).json({ status: 'ERROR', errors: 'You must provide a revista name', data: {}});
    }

    var url = `https://bit.ly/${revista}`;

    service.getRevista(url, revista)
        .then(function(result) {
            Revista.collection.insertOne(result, function(err, docs) {
                if(err) {
                    console.log('erro: ', err.message)
                    res.status(400).json({ status: 'ERROR', errors: 'Erro ao salvar registros: ' + err.message, data: {}});
                }

                res.status(200).json({ status: 'OK', errors: {}, data: result });
            })
        })
        .catch(err => {
            console.log('erro-catch: ', err.message)
            res.status(400).json({ status: 'ERROR', errors: err.message, data: {}});
        });
});
router.get('/famosas/:famosa', (req, res) => {
    var famosa = req.params.famosa

    service.getFamosa(famosa)
        .then(function(result) {
            Mulher.collection.insertOne(result, function(err, docs) {
                if(err) {
                    res.status(400).json({ status: 'ERROR', errors: 'Erro ao salvar registros: ' + err.message, data: {}});
                }

                res.status(200).json({ status: 'OK', errors: {}, data: result });
            })
            
        })
        .catch(err => {
            res.status(400).json({ status: 'ERROR', errors: err.message, data: {}});
        });
});
router.get('/gostosas/:gostosa', (req, res) => {
    var gostosa = req.params.gostosa

    service.getFamosa(gostosa)
        .then(function(result) {
            Mulher.collection.insertOne(result, function(err, docs) {
                if(err) {
                    res.status(400).json({ status: 'ERROR', errors: 'Erro ao salvar registros: ' + err.message, data: {}});
                }

                res.status(200).json({ status: 'OK', errors: {}, data: result });
            })
            
        })
        .catch(err => {
            res.status(400).json({ status: 'ERROR', errors: err.message, data: {}});
        });
});
router.get('/caiu-na-net/:vacilona', (req, res) => {
    var vacilona = req.params.vacilona

    service.getFamosa(vacilona)
        .then(function(result) {
            Mulher.collection.insertOne(result, function(err, docs) {
                if(err) {
                    res.status(400).json({ status: 'ERROR', errors: 'Erro ao salvar registros: ' + err.message, data: {}});
                }

                res.status(200).json({ status: 'OK', errors: {}, data: result });
            })
            
        })
        .catch(err => {
            res.status(400).json({ status: 'ERROR', errors: err.message, data: {}});
        });
});


router.get('/download/:name', (req, res) => {
    var medias = req.query.medias;
    var name = req.params.name;
    var mediasUrl = JSON.parse(medias)
    var pathDir = `c:/temp/revistas/${name}`;

    // cria o diretorio se ele não existir
    checkDirectorySync(pathDir);

    mediasUrl.forEach(mediaUrl => {

        var filename = mediaUrl.split('/').pop();
        console.log({ name: name, filename: filename, mediaUrl: mediaUrl})
        saveMedias(mediaUrl, pathDir, filename)
            .then((data) => {
            })
            .catch(err => res.status(400).json({ message: 'Erro ao tentar salvar as medias' }))
    });

    //res.status(200).json({data: 'sucesso'});
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


//#endregion

module.exports = router;
