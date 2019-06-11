var express = require('express');
var router = express.Router();
var settings = require('../../config/appSettings.json')
var service = require('../services/brasileirinhas.services');


router.get('/', (req, res) => {
    var page = req.query.page;
    var url = settings.urls.filmes
    
    if(page != null) {
        url = `${url}/pagina-${page}.html`
    }
    console.log('[FILMES]: ', url)
    service.getFilmes(url)
        .then(function(result) {
            res.status(200).json({ status: 'OK', errors: {}, data: result });
        })
        .catch(err => {
            res.status(400).json({ status: 'ERROR', errors: err.message, data: {} });
        });
});

router.get('/filme', (req, res) => {
    var url = settings.urls.base_url + req.query.id;        
   console.log('[FILME]: ', url)
    service.getFilmeInfo(url)
        .then(function(result) {
            res.status(200).json({ status: 'OK', errors: {}, data: result });
        })
        .catch(err => {
            res.status(400).json({ status: 'ERROR', errors: err.message, data: {} });
        });
});

module.exports = router;