var express = require('express');
var router = express.Router();
var settings = require('../../config/appSettings');
var appScrits = require('../../config/app-scripts');
var service = require('../services/sexyhot.services');

/*
order=rank (populares)
order=name_ascending (de a-z)
order=name_descending (de z-a)
order=videos_count (qtde de videos)

page=1 (numero da pagina)

gender=F (mulheres)

per_page=24 (qtde por pagina)

*/
router.get('/', (req, res) => {

    var params = appScrits.getParams(req.query)

    var url = appScrits.getUrl(settings.PORNSTARS_URL, params);
   
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

router.get('/:slugName', (req, res) => {

    var url = `${settings.PORNSTARS_URL}/${req.params.slugName}`;

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

router.get('/videos/:id', (req, res) => {

    var url = `${settings.VIDEOS_URL}?pornstars[]=${req.params.id}`;

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

module.exports = router;