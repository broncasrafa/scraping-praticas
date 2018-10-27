var express = require('express');
var router = express.Router();
var VideoService = require('../services/videoService');

router.get('/:id', (req, res) => {
    var id = req.params.id;

    VideoService.getVideo(id)
        .then(function (result) {
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