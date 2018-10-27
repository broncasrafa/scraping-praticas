var express = require('express');
var router = express.Router();
var InstagramService = require('../services/instagram.service');


router.get('/mediasInit/:username', (req, res, next) => {
    InstagramService.getUserMediasInit(req.params.username)
        .then((data) => {
            res.status(200).json(data);
        })
        .catch(err => {
            res.status(400).json({ status: 'error', message: err.message })
        });
});

router.get('/mediasOthers', (req, res, next) => {
    InstagramService.getUserMedias(req.query.userId, req.query.end_cursor)
        .then((data) => {
            res.status(200).json(data);
        })
        .catch(err => {
            res.status(400).json({ status: 'error', message: err.message })
        });
});

router.get('/taggedMedias', (req, res, next) => {
    InstagramService.getUserTaggedMedias(req.query.userId, req.query.end_cursor)
        .then((data) => {
            res.status(200).json(data);
        })
        .catch(err => {
            res.status(400).json({ status: 'error', message: err.message })
        });
});

router.get('/followers', (req, res, next) => {
    InstagramService.getUserFollowers(req.query.userId, req.query.end_cursor)
        .then((data) => {
            res.status(200).json(data);
        })
        .catch(err => {
            res.status(400).json({ status: 'error', message: err.message })
        });
});

router.get('/following', (req, res, next) => {
    InstagramService.getUserFollowing(req.query.userId, req.query.end_cursor)
        .then((data) => {
            res.status(200).json(data);
        })
        .catch(err => {
            res.status(400).json({ status: 'error', message: err.message })
        });
});

router.get('/feed', (req, res, next) => {

    if (req.query.end_cursor == null) {        
        InstagramService.getUserFeedInit()
            .then((data) => {
                res.status(200).json(data);
            })
            .catch(err => {
                res.status(400).json({ status: 'error', message: err.message })
            });
    } else {        
        InstagramService.getUserFeed(req.query.end_cursor)
            .then((data) => {
                res.status(200).json(data);
            })
            .catch(err => {
                res.status(400).json({ status: 'error', message: err.message })
            });
    }
});

router.get('/feed/story', (req, res, next) => {
    InstagramService.getUserFeedStoriesAvailables()
        .then((data) => {
            res.status(200).json(data);
        })
        .catch(err => {
            res.status(400).json({ status: 'error', message: err.message })
        });
});

router.get('/activity', (req, res, next) => {
    InstagramService.getUserActivityNotifications()
            .then((data) => {
                res.status(200).json(data);
            })
            .catch(err => {
                res.status(400).json({ status: 'error', message: err.message })
            });
})



module.exports = router;


/*
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
*/