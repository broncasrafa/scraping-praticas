var express = require('express');
var router = express.Router();
var CategoryService = require('../services/categoryService');

router.get('/countries', (req, res) => {
    CategoryService.getContriesCategory()
        .then(function (result) {
            res.status(200).json({ status: 'OK', errors: {}, data: result });
        })
        .catch(err => {
            res.status(400).json({ status: 'ERROR', errors: err.message, data: {} });
        });
});

router.get('/', (req, res) => {
    var country = req.query.country;
    
    CategoryService.getCategories(country)
        .then(function (result) {
            res.status(200).json({ status: 'OK', errors: {}, data: result });
        })
        .catch(err => {
            res.status(400).json({ status: 'ERROR', errors: err.message, data: {} });
        });
});

router.get('/:category', (req, res) => {
    var category = req.params.category;
    
    CategoryService.getCategory(category)
        .then(function (result) {
            res.status(200).json({ status: 'OK', errors: {}, data: result });
        })
        .catch(err => {
            res.status(400).json({ status: 'ERROR', errors: err.message, data: {} });
        });
});

module.exports = router;