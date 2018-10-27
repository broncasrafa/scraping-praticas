var express = require('express');
var router = express.Router();
var GalleryService = require('../services/galleryService');

router.get('/:id', (req, res) => {
    var id = req.params.id;
    var page = req.query.page;
    
    GalleryService.getGallery(id, page)
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


module.exports = router;