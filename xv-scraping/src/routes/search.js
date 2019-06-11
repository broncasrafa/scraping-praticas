var router = require('express').Router();
var XVService = require('../services/xv-scraping.service');

router.get('/search-suggest', (req, res) => {
    var criteria = req.query.criteria;
    
    XVService.getSearchSuggest(criteria)
        .then(function(data) {
            res.status(200).json({ status: 'OK', errors: {}, data: data });
        })
        .catch(err => {
            res.status(400).json({ 
                status: 'ERROR', 
                errors: {}, 
                data: {}
            });
        });
});

router.get('/', (req, res) => {
    var k = req.query.k;
    var page = req.query.page
    
    XVService.getSearch(k, page)
        .then(function(data) {
            res.status(200).json({ status: 'OK', errors: {}, data: data });
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