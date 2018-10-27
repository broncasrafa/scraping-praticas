var router = require('express').Router();
var XVService = require('../services/xv-scraping.service');
var settings = require('../config/appConfig')

router.get('/', (req, res) => {
    var page = req.query.page;

    var url = settings.XV_BASE_URL + '/channels-index';
           
    if(page != null) {
        url = `${url}/${page}`;
    }

    XVService.getChannels(url)
        .then(function(result) {
            res.status(200).json({ status: 'OK', errors: {}, data: result });
        })
        .catch(err => {
            res.status(400).json({ status: 'ERROR', errors: err.message, data: {} });
        });
});

router.get('/brazil', (req, res) => {
    var page = req.query.page;

    var url = settings.XV_BASE_URL + '/channels-index/brazil';
           
    if(page != null) {
        url = `${url}/${page}`;
    }

    XVService.getChannels(url)
        .then(function(result) {
            res.status(200).json({ status: 'OK', errors: {}, data: result });
        })
        .catch(err => {
            res.status(400).json({ status: 'ERROR', errors: err.message, data: {} });
        });
});

router.get('/latin', (req, res) => {
    var page = req.query.page;

    var url = settings.XV_BASE_URL + '/channels-index/latin';
           
    if(page != null) {
        url = `${url}/${page}`;
    }

    XVService.getChannels(url)
        .then(function(result) {
            res.status(200).json({ status: 'OK', errors: {}, data: result });
        })
        .catch(err => {
            res.status(400).json({ status: 'ERROR', errors: err.message, data: {} });
        });
});

router.get('/new', (req, res) => {
    var page = req.query.page;

    var url = settings.XV_BASE_URL + '/channels-index/new';
           
    if(page != null) {
        url = `${url}/${page}`;
    }

    XVService.getChannels(url)
        .then(function(result) {
            res.status(200).json({ status: 'OK', errors: {}, data: result });
        })
        .catch(err => {
            res.status(400).json({ status: 'ERROR', errors: err.message, data: {} });
        });
});

router.get('/top', (req, res) => {
    var page = req.query.page;

    var url = settings.XV_BASE_URL + '/channels-index/top';
           
    if(page != null) {
        url = `${url}/${page}`;
    }

    XVService.getChannels(url)
        .then(function(result) {
            res.status(200).json({ status: 'OK', errors: {}, data: result });
        })
        .catch(err => {
            res.status(400).json({ status: 'ERROR', errors: err.message, data: {} });
        });
});

router.get('/top/brazil', (req, res) => {
    var page = req.query.page;

    var url = settings.XV_BASE_URL + '/channels-index/brazil/top';
           
    if(page != null) {
        url = `${url}/${page}`;
    }

    XVService.getChannels(url)
        .then(function(result) {
            res.status(200).json({ status: 'OK', errors: {}, data: result });
        })
        .catch(err => {
            res.status(400).json({ status: 'ERROR', errors: err.message, data: {} });
        });
});

router.get('/top/latin', (req, res) => {
    var page = req.query.page;

    var url = settings.XV_BASE_URL + '/channels-index/latin/top';
           
    if(page != null) {
        url = `${url}/${page}`;
    }

    XVService.getChannels(url)
        .then(function(result) {
            res.status(200).json({ status: 'OK', errors: {}, data: result });
        })
        .catch(err => {
            res.status(400).json({ status: 'ERROR', errors: err.message, data: {} });
        });
});

module.exports = router;