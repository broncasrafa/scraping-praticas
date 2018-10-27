var express = require('express')
var router = express.Router()
var service = require('../services/seujeca.services')
var settings = require('../../config/settings.json')
var Mulher = require('../models/mulheres')

router.get('/famosas', (req, res) => {
    var page = req.query.page;

    var url = `${ settings.urls.base_url }/mulheres`

    if(page != null) {
        url = `${url}/page/${page}`
    }

    service.getFamosas(url)
        .then(function(result) {
            res.status(200).json({ status: 'OK', errors: {}, data: result });
        })
        .catch(err => {
            res.status(400).json({ status: 'ERROR', errors: err.message, data: {}});
        });
});

router.get('/famosas/:famosa', (req, res) => {
    var famosa = req.params.famosa

    service.getFamosa(famosa)
        .then(function(result) {
            res.status(200).json({ status: 'OK', errors: {}, data: result });
            
            // Mulher.collection.insertOne(result, function(err, docs) {
            //     if(err) {
            //         res.status(400).json({ status: 'ERROR', errors: 'Erro ao salvar registros: ' + err.message, data: {}});
            //     }

            //     res.status(200).json({ status: 'OK', errors: {}, data: result });
            // })
            
        })
        .catch(err => {
            res.status(400).json({ status: 'ERROR', errors: err.message, data: {}});
        });
});

router.get('/gostosas', (req, res) => {
    var page = req.query.page;

    var url = `${ settings.urls.base_url }/gostosas`

    if(page != null) {
        url = `${url}/page/${page}`
    }

    service.getFamosas(url)
        .then(function(result) {
            res.status(200).json({ status: 'OK', errors: {}, data: result });
        })
        .catch(err => {
            res.status(400).json({ status: 'ERROR', errors: err.message, data: {}});
        });
});

router.get('/gostosas/:gostosa', (req, res) => {
    var gostosa = req.params.gostosa

    service.getFamosa(gostosa)
        .then(function(result) {
            res.status(200).json({ status: 'OK', errors: {}, data: result });
            
            // Mulher.collection.insertOne(result, function(err, docs) {
            //     if(err) {
            //         res.status(400).json({ status: 'ERROR', errors: 'Erro ao salvar registros: ' + err.message, data: {}});
            //     }

            //     res.status(200).json({ status: 'OK', errors: {}, data: result });
            // })
            
        })
        .catch(err => {
            res.status(400).json({ status: 'ERROR', errors: err.message, data: {}});
        });
});

router.get('/caiu-na-net', (req, res) => {
    var page = req.query.page;

    var url = `${ settings.urls.base_url }/gostosas/caiu-na-net/`

    if(page != null) {
        url = `${url}/page/${page}`
    }

    service.getListCaiuNaNet(url)
        .then(function(result) {
            res.status(200).json({ status: 'OK', errors: {}, data: result });
        })
        .catch(err => {
            res.status(400).json({ status: 'ERROR', errors: err.message, data: {}});
        });
});

router.get('/caiu-na-net/:vacilona', (req, res) => {
    var vacilona = req.params.vacilona

    service.getFamosa(vacilona)
        .then(function(result) {
            res.status(200).json({ status: 'OK', errors: {}, data: result });
            
            // Mulher.collection.insertOne(result, function(err, docs) {
            //     if(err) {
            //         res.status(400).json({ status: 'ERROR', errors: 'Erro ao salvar registros: ' + err.message, data: {}});
            //     }

            //     res.status(200).json({ status: 'OK', errors: {}, data: result });
            // })
            
        })
        .catch(err => {
            res.status(400).json({ status: 'ERROR', errors: err.message, data: {}});
        });
});

module.exports = router;