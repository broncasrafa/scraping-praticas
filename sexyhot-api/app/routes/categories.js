var express = require('express');
var router = express.Router();
var appScrits = require('../../config/app-scripts');
var settings = require('../../config/appSettings');
var service = require('../services/sexyhot.services');

router.get('/', (req, res) => {
    service.getData(settings.CATEGORIES_URL)
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
order=recent (mais recentes)
order=most_viewed (mais vistos)
order=longer (mais curtos)
order=shorter (mais longos)
order=most_rated (mais avaliados)
page=1
*/
router.get('/videos/:videoid', (req, res) => {

    var params = appScrits.getParams(req.query);

    var url = `${settings.VIDEOS_URL}?categories[]=${req.params.videoid}`;

    if(params.length > 0) {
        url = `${url}&${params}`;
    }

    service.getData(url)
        .then(function(result) {
            res.status(200).json({ status: 'OK', errors: {}, data: result });
        })
        .catch(err => {
            res.status(400).json({ status: 'ERROR', errors: err.message, data: {} });
        });
});

module.exports = router;