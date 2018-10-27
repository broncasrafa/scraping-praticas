var express = require('express');
var router = express.Router();
var settings = require('../../config/appSettings');
var appScrits = require('../../config/app-scripts');
var service = require('../services/sexyhot.services');

/*
page=1
kind=movie, series (filme ou serie)
sorting=recent, most_viewed, most_liked (recentes, mais vistos, mais curtidos)
per_page=24 (qtde por pagina)
*/
router.get('/', (req, res) => {

    var params = appScrits.getParams(req.query)

    var url = appScrits.getUrl(settings.COLLECTIONS_URL, params);
   
    service.getData(url)
        .then(function(result) {
            res.status(200).json({ status: 'OK', errors: {}, data: result });
        })
        .catch(err => {
            res.status(400).json({ status: 'ERROR', errors: err.message, data: {} });        
        });
});

router.get('/video/:id', (req, res) => {
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
