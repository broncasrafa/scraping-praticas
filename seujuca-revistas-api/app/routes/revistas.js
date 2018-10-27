var express = require('express')
var router = express.Router()
var service = require('../services/seujeca.services')
var Revista = require('../models/revistas')
var settings = require('../../config/settings.json')

// retorna a lista de categorias
router.get('/categorias', (req, res) => {
    service.getCategorias()
        .then((result) => { res.status(200).json({ status: 'OK', errors: {}, data: result });})
        .catch(err => { res.status(400).json({ status: 'ERROR', errors: err.message, data: {}}); })
});

// retorna a lista de revistas
router.get('/marca/:marca', (req, res) => {
    var marca = req.params.marca
    var page = req.query.page
    var url = `https://www.seujeca.com/${marca}`;

    if(page != null) {
        url = url + '/page/' + page;
    }
// revista-sexy
// playboy
    service.getRevistas(url, marca)
        .then(function(result) {            
            res.status(200).json({ status: 'OK', errors: {}, data: result });            
        })
        .catch(err => {
            res.status(400).json({ status: 'ERROR', errors: err.message, data: {}});
        });
})

// retorna a revista
router.get('/:revista', (req, res) => {
    var revista = req.params.revista;

    if(!revista){        
        res.status(400).json({ status: 'ERROR', errors: 'You must provide a revista name', data: {}});
    }

    var url = `${settings.urls.base_url}/${revista}/`;

    service.getRevista(url, revista)
        .then(function(result) {
            res.status(200).json({ status: 'OK', errors: {}, data: result });
            /*
            Revista.collection.insertOne(result, function(err, docs) {
                if(err) {
                    res.status(400).json({ status: 'ERROR', errors: 'Erro ao salvar registros: ' + err.message, data: {}});
                }

                res.status(200).json({ status: 'OK', errors: {}, data: result });
            })
            */
        })
        .catch(err => {
            res.status(400).json({ status: 'ERROR', errors: err.message, data: {}});
        });
});

// retorna a revista quando ela tem o bit.ly
router.get('/bitly/:revista', (req, res) => {
    var revista = req.params.revista;

    if(!revista){        
        res.status(400).json({ status: 'ERROR', errors: 'You must provide a revista name', data: {}});
    }

    var url = `https://bit.ly/${revista}`;

    service.getRevista(url, revista)
        .then(function(result) {
            res.status(200).json({ status: 'OK', errors: {}, data: result });
        })
        .catch(err => {
            res.status(400).json({ status: 'ERROR', errors: err.message, data: {}});
        });
});



module.exports = router;