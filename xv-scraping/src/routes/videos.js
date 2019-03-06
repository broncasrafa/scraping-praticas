var router = require('express').Router();
var XVService = require('../services/xv-scraping.service');
var settings = require('../config/appConfig');


router.get('/verified', (req, res) => {
    var page = req.query.page;

    XVService.getVerifiedVideos(page)
        .then(function(result) {
            res.status(200).json({ status: 'OK', errors: {}, data: result });
        })
        .catch(err => {
            res.status(400).json({ status: 'ERROR', errors: err.message, data: {} });
        });
});

router.get('/best', (req, res) => {
    var page = req.query.page;
    var ano = req.query.ano
    var mes = req.query.mes

    if(ano == null || mes == null) {        
        res.status(400).json({ status: 'ERROR', errors: 'Informe o ano e o mês', data: {} });
        return; 
    }

    if(parseInt(ano) < 2007) {        
        res.status(400).json({ status: 'ERROR', errors: 'Ano minimo é 2007', data: {} });
        return; 
    }

    if(parseInt(ano) > new Date().getFullYear()) {        
        res.status(400).json({ status: 'ERROR', errors: 'Ano maior que o ano atual', data: {} });
        return; 
    }

    if(parseInt(mes) < 1 || parseInt(mes) > 12) {        
        res.status(400).json({ status: 'ERROR', errors: 'Mês inválido', data: {} });
        return;        
    }

    var mesTratado = parseInt(mes);
    mes = mesTratado < 10 ? "0"+mesTratado : mesTratado;

    var periodRange = `${ano}-${mes}`
    var url = settings.XV_BASE_URL + '/best/' + periodRange;
    // https://www.xvideos.com/best/2018-10  
    // minimo = 2007-04
    console.log(url);
           
    if(page != null) {
        url = `${url}/${page}`;
    }

    XVService.getBestVideos(url)
        .then(function(result) {
            res.status(200).json({ status: 'OK', errors: {}, data: result });
        })
        .catch(err => {
            res.status(400).json({ status: 'ERROR', errors: err.message, data: {} });
        });
});

router.get('/video/url', (req, res) => {
    var videoId = req.query.urlVideoId;
    var videoTitle = req.query.urlVideoTitle;
    var url = `${settings.XV_BASE_URL}/${videoId}/${videoTitle}`
    
    XVService.getVideoUrl(url)
        .then(function(result) {
            res.status(200).json({ status: 'OK', errors: {}, data: result });
        })
        .catch(err => {
            res.status(400).json({ status: 'ERROR', errors: err.message, data: {} });
        });

})




module.exports = router;