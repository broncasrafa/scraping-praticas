var express = require('express');
var router = express.Router();
var settings = require('../../config/appSettings.json')
var service = require('../services/brasileirinhas.services');


router.get('/', (req, res) => {
    var page = req.query.page;
    var url = settings.urls.pornstars
    
    if(page != null) {
        url = `${url}/pagina-${page}.html`
    }
    console.log('[LIST]: ', url)
    service.getPornstars(url)
        .then(function(result) {
            res.status(200).json({ status: 'OK', errors: {}, data: result });
        })
        .catch(err => {
            res.status(400).json({ status: 'ERROR', errors: err.message, data: {} });
        });
});

router.get('/pornstar', (req, res) => {
    var url = `${settings.urls.pornstars}/perfil/${req.query.id}`        
   console.log('[INFO]: ', url)
    service.getPornstarInfo(url)
        .then(function(result) {
            res.status(200).json({ status: 'OK', errors: {}, data: result });
        })
        .catch(err => {
            res.status(400).json({ status: 'ERROR', errors: err.message, data: {} });
        });
});

router.get('/pornstar/ensaio', (req, res) => {
    var url = `${settings.urls.pornstars}/perfil/${req.query.id}/ensaio`
    console.log('[ENSAIO]: ', url)
    service.getPornstarEnsaio(url)
        .then(function(result) {
            res.status(200).json({ status: 'OK', errors: {}, data: result });
        })
        .catch(err => {
            res.status(400).json({ status: 'ERROR', errors: err.message, data: {} });
        });
})

router.get('/pornstar/filmografia', (req, res) => {
    var url = `${settings.urls.pornstars}/perfil/${req.query.id}/filmografia`
    console.log('[FILMOGRAFIA]: ', url)
    service.getPornstarFilmografia(url)
        .then(function(result) {
            res.status(200).json({ status: 'OK', errors: {}, data: result });
        })
        .catch(err => {
            res.status(400).json({ status: 'ERROR', errors: err.message, data: {} });
        });
})

router.get('/pornstar/videos', (req, res) => {
    var url = `${settings.urls.pornstars}/perfil/${req.query.id}/videos`
    console.log('[VIDEOS]: ', url)
    service.getPornstarVideos(url)
        .then(function(result) {
            res.status(200).json({ status: 'OK', errors: {}, data: result });
        })
        .catch(err => {
            res.status(400).json({ status: 'ERROR', errors: err.message, data: {} });
        });
})

router.get('/wallpapers', (req, res) => {
    var page = req.query.page;
    var url = settings.urls.wallpapers;

    if(page != null) {
        url = `${url}/pagina-${page}.html`
    }
    console.log('[WALLPAPERS]: ', url)
    service.getWallpapers(url)
        .then(function(result) {
            res.status(200).json({ status: 'OK', errors: {}, data: result });
        })
        .catch(err => {
            res.status(400).json({ status: 'ERROR', errors: err.message, data: {} });
        });
})

module.exports = router;

// https://www.brasileirinhas.com.br/pornstars/perfil/870/elisa-sanches/
// https://www.brasileirinhas.com.br/pornstars/perfil/870/elisa-sanches/ensaio/
// https://www.brasileirinhas.com.br/pornstars/perfil/870/elisa-sanches/filmografia/
// https://www.brasileirinhas.com.br/pornstars/perfil/870/elisa-sanches/videos/
// https://www.acasadasbrasileirinhas.com.br/atriz/elisa-sanches.html

// mia-linz