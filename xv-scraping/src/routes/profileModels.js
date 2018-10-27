var router = require('express').Router();
var XVService = require('../services/xv-scraping.service');
var settings = require('../config/appConfig')

router.get('/', (req, res) => {
    var page = req.query.page;
    var url = settings.XV_BASE_URL + '/profileslist'

    if(page != null) {
        url = `${url}/${page}`;
    }

    XVService.getProfiles(url)
        .then(function(result) {
            res.status(200).json({ status: 'OK', errors: {}, data: result });
        })
        .catch(err => {
            res.status(400).json({ status: 'ERROR', errors: err.message, data: {} });
        });
});

router.get('/unverified', (req, res) => {
    var page = req.query.page;
    var url = settings.XV_BASE_URL + '/profileslist/unverified'

    if(page != null) {
        url = `${url}/${page}`;
    }

    XVService.getProfiles(url)
        .then(function(result) {
            res.status(200).json({ status: 'OK', errors: {}, data: result });
        })
        .catch(err => {
            res.status(400).json({ status: 'ERROR', errors: err.message, data: {} });
        });
});

router.get('/newWomen', (req, res) => {
    var page = req.query.page;
    var url = settings.XV_BASE_URL + '/profiles-index'

    if(page != null) {
        url = `${url}/${page}`;
    }

    XVService.getProfiles(url)
        .then(function(result) {
            res.status(200).json({ status: 'OK', errors: {}, data: result });
        })
        .catch(err => {
            res.status(400).json({ status: 'ERROR', errors: err.message, data: {} });
        });
});

// ???
router.get('/:name', (req, res) => {
    var page = req.query.page;
    var name = req.params.name;

    XVService.getProfilesListByName(name, page)
        .then(function(result) {
            res.status(200).json({ status: 'OK', errors: {}, data: result });
        })
        .catch(err => {
            res.status(400).json({ 
                status: 'ERROR', 
                errors: {}, 
                data: {}
            });
        });
});

// ???
router.get('/model/:name', (req, res) => {
    var page = req.query.page;
    var name = req.params.name;

    XVService.getProfilesListModelsByName(name, page)
        .then(function(result) {
            
            res.status(200).json({ status: 'OK', errors: {}, data: result });
        })
        .catch(err => {
            res.status(400).json({ 
                status: 'ERROR', 
                errors: {}, 
                data: {}
            });
        });
});

module.exports = router;