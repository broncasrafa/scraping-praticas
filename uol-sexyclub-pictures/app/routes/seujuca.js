var express = require('express')
var router = express.Router()
var service = require('../services/seujuca.services')

// revista-sexy-dezembro-bia-dominguez

router.get('/:revista', (req, res) => {
    var revista = req.params.revista;
    service.getPhotos(revista)
        .then(function(result) {
            res.status(200).json({ status: 'OK', errors: {}, data: result });
        })
        .catch(err => {
            res.status(400).json({ status: 'ERROR', errors: err.message, data: {}});
        });
});

// revista-sexy
// playboy
router.get('/revistas/:marca', (req, res) => {
    var marca = req.params.marca
    var page = req.query.page
    var url = `https://www.seujeca.com/${marca}`;

    if(page != null) {
        url = url + '/page/' + page;
    }

    service.getRevistas(url)
        .then(function(result) {
            res.status(200).json({ status: 'OK', errors: {}, data: result });
        })
        .catch(err => {
            res.status(400).json({ status: 'ERROR', errors: err.message, data: {}});
        });
})


module.exports = router;