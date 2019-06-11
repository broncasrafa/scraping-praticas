var express = require('express');
var router = express.Router();
var settings = require('../../config/appSettings.json')
var service = require('../services/brasileirinhas.services');
var Pornstar = require('../models/pornstar')
var Ensaio = require('../models/ensaio')

router.get('/pornstar', (req, res) => {
    var id = decodeURIComponent(req.query.id)
    var url = `${settings.urls.pornstars}/perfil/${id}`
    console.log('[SALVAR]:', url)
    service.getPornstarInfo(url)
        .then(function(result) {
            //console.log(result)
            Pornstar.collection.insertOne(result, function(err, doc) {
                if(err) {
                    res.status(400).json({ status: 'ERROR', errors: 'Erro ao salvar registros: ' + err.message, data: {}});
                }

                res.status(200).json({ status: 'OK', errors: {}, data: result });
            })
        })
        .catch(err => {
            res.status(400).json({ status: 'ERROR', errors: err.message, data: {} });
        });
})

router.get('/pornstar/ensaio', (req, res) => {
    var url = `${settings.urls.pornstars}/perfil/${req.query.id}/ensaio`
    console.log('[SALVAR]: ', url)
    service.getPornstarEnsaio(url)
        .then(function(result) {
            Ensaio.collection.insertOne(result, function(err, doc) {
                if(err) {
                    res.status(400).json({ status: 'ERROR', errors: 'Erro ao salvar registros: ' + err.message, data: {}});
                }

                res.status(200).json({ status: 'OK', errors: {}, data: result });
            })
        })
        .catch(err => {
            res.status(400).json({ status: 'ERROR', errors: err.message, data: {} });
        });
})


module.exports = router;