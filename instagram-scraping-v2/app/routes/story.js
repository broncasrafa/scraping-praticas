var express = require('express');
var router = express.Router();
var InstagramService = require('../services/instagram.service');

router.get('/list', (req, res, next) => {
    var idsQuery = req.query.reel_ids;

    if(idsQuery.length == 0) {
        res.status(400).json({ status: 'error', message: 'You must provide stories ids list' })
    }

    var ids = idsQuery.trim().split(',');

    var reel_ids = ids.join('%22%2C%22');
    
    InstagramService.getStoryList(reel_ids)
        .then((data) => {
            res.status(200).json(data);
        })
        .catch(err => {
            res.status(400).json({ status: 'error', message: err.message })
        });
});

router.get('/recents/:userId', (req, res, next) => {
    InstagramService.getUserRecentStories(req.params.userId)
    .then((data) => {
        res.status(200).json(data);
    })
    .catch(err => {
        res.status(400).json({ status: 'error', message: err.message })
    });
});

router.get('/highlight/:userId', (req, res, next) => {
    InstagramService.getUserHighlightStories(req.params.userId)
    .then((data) => {
        res.status(200).json(data);
    })
    .catch(err => {
        res.status(400).json({ status: 'error', message: err.message })
    });
});

module.exports = router;