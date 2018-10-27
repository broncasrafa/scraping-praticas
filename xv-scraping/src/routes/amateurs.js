var router = require('express').Router();
var XVService = require('../services/xv-scraping.service');
var settings = require('../config/appConfig')

router.get('/', (req, res) => {
    var page = req.query.page;
    var url = settings.XV_BASE_URL + '/amateurs-index'

    if(page != null) {
        url = `${url}/${page}`;
    }

    XVService.getAmateurs(url)
        .then(function(result) {
            res.status(200).json({ status: 'OK', errors: {}, data: result });
        })
        .catch(err => {
            res.status(400).json({ status: 'ERROR', errors: err.message, data: {} });
        });
});

router.get('/brazil', (req, res) => {
    var page = req.query.page;
    var url = settings.XV_BASE_URL + '/amateurs-index/brazil'

    if(page != null) {
        url = `${url}/${page}`;
    }

    XVService.getAmateurs(url)
        .then(function(result) {
            res.status(200).json({ status: 'OK', errors: {}, data: result });
        })
        .catch(err => {
            res.status(400).json({ status: 'ERROR', errors: err.message, data: {} });
        });
});

router.get('/latin', (req, res) => {
    var page = req.query.page;
    var url = settings.XV_BASE_URL + '/amateurs-index/latin'

    if(page != null) {
        url = `${url}/${page}`;
    }

    XVService.getAmateurs(url)
        .then(function(result) {
            res.status(200).json({ status: 'OK', errors: {}, data: result });
        })
        .catch(err => {
            res.status(400).json({ status: 'ERROR', errors: err.message, data: {} });
        });
});

router.get('/ever', (req, res) => {
    var page = req.query.page;
    var url = settings.XV_BASE_URL + '/amateurs-index/ever'

    if(page != null) {
        url = `${url}/${page}`;
    }

    XVService.getAmateurs(url)
        .then(function(result) {
            res.status(200).json({ status: 'OK', errors: {}, data: result });
        })
        .catch(err => {
            res.status(400).json({ status: 'ERROR', errors: err.message, data: {} });
        });
});

router.get('/ever/brazil', (req, res) => {
    var page = req.query.page;
    var url = settings.XV_BASE_URL + '/amateurs-index/brazil/ever'

    if(page != null) {
        url = `${url}/${page}`;
    }

    XVService.getAmateurs(url)
        .then(function(result) {
            res.status(200).json({ status: 'OK', errors: {}, data: result });
        })
        .catch(err => {
            res.status(400).json({ status: 'ERROR', errors: err.message, data: {} });
        });
});

router.get('/ever/latin', (req, res) => {
    var page = req.query.page;
    var url = settings.XV_BASE_URL + '/amateurs-index/latin/ever'

    if(page != null) {
        url = `${url}/${page}`;
    }

    XVService.getAmateurs(url)
        .then(function(result) {
            res.status(200).json({ status: 'OK', errors: {}, data: result });
        })
        .catch(err => {
            res.status(400).json({ status: 'ERROR', errors: err.message, data: {} });
        });
});

router.get('/list', (req, res) => {
    var url = settings.XV_BASE_URL + '/amateurs-index/list';

    XVService.getEntitiesList(url)
        .then(function(result) {
            res.status(200).json({ status: 'OK', errors: {}, data: result });
        })
        .catch(err => {
            res.status(400).json({ status: 'ERROR', errors: err.message, data: {} });
        });
});

router.get('/countries', (req, res) => {
    var url = settings.XV_BASE_URL + '/amateurs-index/countries';

    XVService.getEntitiesCountries(url)
        .then(function(result) {
            res.status(200).json({ status: 'OK', errors: {}, data: result });
        })
        .catch(err => {
            res.status(400).json({ status: 'ERROR', errors: err.message, data: {} });
        });
});

router.get('/countries/:country', (req, res) => {
    var page = req.query.page;
    var country = req.params.country;

    var url = settings.XV_BASE_URL + '/amateurs-index/' + country.toLowerCase();
            
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

router.get('/new', (req, res) => {
    var page = req.query.page;

    var url = settings.XV_BASE_URL + '/amateurs-index/new';
           
    if(page != null) {
        url = `${url}/${page}`;
    }

    XVService.getAmateurs(url)
        .then(function(result) {
            res.status(200).json({ status: 'OK', errors: {}, data: result });
        })
        .catch(err => {
            res.status(400).json({ status: 'ERROR', errors: err.message, data: {} });
        });
});

router.get('/new/brazil', (req, res) => {
    var page = req.query.page;

    var url = settings.XV_BASE_URL + '/amateurs-index/new/brazil';
           
    if(page != null) {
        url = `${url}/${page}`;
    }

    XVService.getAmateurs(url)
        .then(function(result) {
            res.status(200).json({ status: 'OK', errors: {}, data: result });
        })
        .catch(err => {
            res.status(400).json({ status: 'ERROR', errors: err.message, data: {} });
        });
});

router.get('/new/latin', (req, res) => {
    var page = req.query.page;

    var url = settings.XV_BASE_URL + '/amateurs-index/new/latin';
           
    if(page != null) {
        url = `${url}/${page}`;
    }

    XVService.getAmateurs(url)
        .then(function(result) {
            res.status(200).json({ status: 'OK', errors: {}, data: result });
        })
        .catch(err => {
            res.status(400).json({ status: 'ERROR', errors: err.message, data: {} });
        });
});

router.get('/new/:country', (req, res) => {
    var country = req.params.country;
    var page = req.query.page;    
    var url = settings.XV_BASE_URL + '/amateurs-index/new/' + country.toLowerCase();
        
    if(page != null) {
        url = `${url}/${page}`;
    }

    XVService.getAmateurs(url)
        .then(function(result) {
            res.status(200).json({ status: 'OK', errors: {}, data: result });
        })
        .catch(err => {
            res.status(400).json({ status: 'ERROR', errors: err.message, data: {} });
        });
});

module.exports = router;