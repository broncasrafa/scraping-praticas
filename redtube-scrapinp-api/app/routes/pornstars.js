var express = require('express');
var router = express.Router();
var PornStarsService = require('../services/pornstarsService');


router.get('/', (req, res) => {
    var page = req.query.page;
    PornStarsService.getPornStarsList(page)
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
})

router.get('/destaque-week', (req, res) => {
    PornStarsService.getPornStarsDestaqueList()
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
})

router.get('/startsWith/:startsWith', (req, res) => {
    var page = req.query.page;
    var startsWith = req.params.startsWith;

    PornStarsService.getPornStarsAlphabeticList(startsWith, page)
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
})

router.get('/:name', (req, res) => {
    var name = req.params.name;
    
    PornStarsService.getPornStarByName(name)
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

router.get('/videos/:name', (req, res) => {
    var name = req.params.name;
    var page = req.query.page;
    
    PornStarsService.getPornStarVideos(name, page)
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

router.get('/gallery/:name', (req, res) => {
    var name = req.params.name;
    var page = req.query.page;
    
    PornStarsService.getPornStarGalleries(name, page)
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