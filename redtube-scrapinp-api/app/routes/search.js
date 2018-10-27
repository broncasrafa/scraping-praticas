var express = require('express');
var router = express.Router();
var SearchService = require('../services/searchService');

router.get('/', (req, res) => {
    var type = req.query.type;
    var term = req.query.q;
    var page = req.query.page;

    if(type == 'gallery') {
        SearchService.getSearchForPhotos(term, page)
            .then(function (result) {
                res.status(200).json({ status: 'OK', errors: {}, data: result });
            })
            .catch(err => {
                res.status(400).json({ status: 'ERROR', errors: err.message, data: {} });
            });
    } else {
        SearchService.getSearchForVideos(term, page)
            .then(function (result) {
                res.status(200).json({ status: 'OK', errors: {}, data: result });
            })
            .catch(err => {
                res.status(400).json({ status: 'ERROR', errors: err.message, data: {} });
            });
    }        
})


module.exports = router;