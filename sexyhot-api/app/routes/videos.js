var express = require('express');
var router = express.Router();
var appScrits = require('../../config/app-scripts');
var settings = require('../../config/appSettings');
var service = require('../services/sexyhot.services');

/*
order=recent (recentes)
order=most_viewed (mais vistos)
order=longer (longos)
order=shorter (curtos)
order=most_rated (mais votados)

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

router.get('/:id', (req, res) => {
    service.getData(`${settings.VIDEOS_URL}/${req.params.id}`)
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