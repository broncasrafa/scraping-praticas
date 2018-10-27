var router = require('express').Router();
var XVService = require('../services/xv-scraping.service');
var settings = require('../config/appConfig')

router.get('/', (req, res) => {
    var page = req.query.page;

    var url = settings.XV_BASE_URL + '/porn-actresses-index';
           
    if(page != null) {
        url = `${url}/${page}`;
    }

    XVService.getPornActresses(url)
        .then(function(result) {
            res.status(200).json({ status: 'OK', errors: {}, data: result });
        })
        .catch(err => {
            res.status(400).json({ status: 'ERROR', errors: err.message, data: {} });
        });
});

router.get('/brazil', (req, res) => {
    var page = req.query.page;

    var url = settings.XV_BASE_URL + '/porn-actresses-index/brazil';
           
    if(page != null) {
        url = `${url}/${page}`;
    }

    XVService.getPornActresses(url)
        .then(function(result) {
            res.status(200).json({ status: 'OK', errors: {}, data: result });
        })
        .catch(err => {
            res.status(400).json({ status: 'ERROR', errors: err.message, data: {} });
        });
});

router.get('/latin', (req, res) => {
    var page = req.query.page;

    var url = settings.XV_BASE_URL + '/porn-actresses-index/latin';
           
    if(page != null) {
        url = `${url}/${page}`;
    }

    XVService.getPornActresses(url)
        .then(function(result) {
            res.status(200).json({ status: 'OK', errors: {}, data: result });
        })
        .catch(err => {
            res.status(400).json({ status: 'ERROR', errors: err.message, data: {} });
        });
});

router.get('/list', (req, res) => {
    var url = settings.XV_BASE_URL + '/porn-actresses-index/list';

    XVService.getEntitiesList(url)
        .then(function(result) {
            res.status(200).json({ status: 'OK', errors: {}, data: result });
        })
        .catch(err => {
            res.status(400).json({ status: 'ERROR', errors: err.message, data: {} });
        });
});

router.get('/countries', (req, res) => {
    var url = settings.XV_BASE_URL + '/porn-actresses-index/countries'

    XVService.getEntitiesCountries(url)
        .then(function(result) {
            res.status(200).json({ status: 'OK', errors: {}, data: result });
        })
        .catch(err => {
            res.status(400).json({ status: 'ERROR', errors: err.message, data: {} });
        });
});

router.get('/countries/:country', (req, res) => {
    var country = req.params.country;
    var page = req.query.page;

    var url = settings.XV_BASE_URL + '/porn-actresses-index/' + country.toLowerCase();
           
    if(page != null) {
        url = `${url}/${page}`;
    }

    XVService.getEntitiesByCountry(url)
        .then(function(result) {
            res.status(200).json({ status: 'OK', errors: {}, data: result });
        })
        .catch(err => {
            res.status(400).json({ status: 'ERROR', errors: err.message, data: {} });
        });
});

module.exports = router;