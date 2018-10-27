var express = require('express');
var router = express.Router();
var settings = require('../../config/appSettings');
var service = require('../services/sexyhot.services');

router.get('/', (req, res) => {
    service.getData(settings.HIGHLIGHTS_URL)
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