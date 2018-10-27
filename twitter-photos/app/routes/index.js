var express = require('express');
var router = express.Router();
var credentials  = require('../../config/credentials/credentials.json');
var Twitter = require('twitter');


router.get('/', (req, res, next) => {
    res.render('index', {
        title: 'Baixador de Fotos do Twitter'
    })
});

router.get('/user/tweet_show/:id', (req, res, next) => {
    
    var client = new Twitter(credentials.twitter);

    var params = { id: req.params.id }
    client.get('statuses/show', params, function(error, tweets, response) {
        if (error) {
            console.log(tweets);
        }
        res.status(200).json({ data: tweets });
    })
})

router.get('/user/timeline_init/:screen_name', (req, res, next) => {
    
    var client = new Twitter(credentials.twitter);

    var params = { screen_name: req.params.screen_name, count: 200 }
    client.get('statuses/user_timeline', params, function(error, tweets, response) {
        if (error) {
            console.log(tweets);
        }
        res.status(200).json({ data: tweets });
    })
})

router.get('/user/timeline_others/:screen_name', (req, res, next) => {
    
    var client = new Twitter(credentials.twitter);

    var max_id = req.query.max_id;
    var params = { screen_name: req.params.screen_name, max_id: max_id, count: 200 }
    client.get('statuses/user_timeline', params, function(error, tweets, response) {
        if (error) {
            console.log(tweets);
        }
        res.status(200).json({ data: tweets });
    })
});

router.get('/user/timeline/has_next', (req, res) => {
    var screen_name = req.query.screen_name
    var id = req.query.max_id;
    
    var client = new Twitter(credentials.twitter);
    
    var params = { screen_name: screen_name, max_id: id, count: 1 }

    client.get('statuses/user_timeline', params, function(error, tweets, response) {
        if (error) {
            console.log(tweets);
        }

        var has_next = false;

        if(tweets.length > 0) {
            has_next = true;
        }

        res.status(200).json({ data: has_next });
    })
})

module.exports = router;

// 'fabianethompsn'