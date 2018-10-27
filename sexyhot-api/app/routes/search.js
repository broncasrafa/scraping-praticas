var express = require('express');
var router = express.Router();
var appScrits = require('../../config/app-scripts');
var settings = require('../../config/appSettings');
var service = require('../services/sexyhot.services');


/*
q=Monica (string com a busca)
page=1 (numero da pagina)
*/
router.get('/', (req, res) => {
    var params = appScrits.getParams(req.query)

    var url = appScrits.getUrl(settings.VIDEOS_URL, params);
   
    service.getData(url)
        .then(function(result) {
            res.status(200).json({ status: 'OK', errors: {}, data: result });
        })
        .catch(err => {
            res.status(400).json({ 
                status: 'ERROR', 
                errors: err.message, 
                data: {}
            });
        });
});

/*
q=Monica (string com a busca)
*/
router.get('/suggest', (req, res) => {
    service.getData(`${settings.SUGGEST_URL}?q=${req.query.q}`)
        .then(function(result) {
            res.status(200).json({ status: 'OK', errors: {}, data: result });
        })
        .catch(err => {
            res.status(400).json({ 
                status: 'ERROR', 
                errors: err.message, 
                data: {}
            });
        });
});

module.exports = router;