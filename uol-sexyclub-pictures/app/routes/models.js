var express = require('express');
var router = express.Router();
var settings = require('../../config/appSettings');
var service = require('../services/sexyclub.services');

//#region Sexy Models
router.get('/', (req, res) => {
    var page = req.query.page;

    var url = settings.SEXY_MODELS_URL;

    if(page != null) {
        url = url + '/page/' + page;
    }

    service.getModels(url)
        .then(function(result) {
            res.status(200).json({ status: 'OK', errors: {}, data: result });
        })
        .catch(err => {
            res.status(400).json({ status: 'ERROR', errors: err.message, data: {}});
        });
});

router.get('/model/:id', (req, res) => {
    if(!req.params.id) {
        res.status(400).json({ status: 'ERROR', errors: 'Argument "id" must be specified', data: {}});
    }
    var id = req.params.id;
    var url = `${settings.SEXY_MODEL_URL}/${id}`;
    service.getModel(url, id)
        .then(function(result) {
            res.status(200).json({ status: 'OK', errors: {}, data: result });
        })
        .catch(err => {
            res.status(400).json({ status: 'ERROR', errors: err.message, data: {}});
        });
});
//#endregion

//#region Area Gratis
router.get('/gratis', (req, res) => {
    var page = req.query.page;
    var url = settings.AREA_GRATIS_URL;
    if(page != null) {
        url = `${url}/page/${page}`;
    }
    
    service.getModels(url)
        .then((result) => {
            res.status(200).json({ status: 'OK', errors: {}, data: result });
        })
        .catch(err => {
            res.status(400).json({ status: 'ERROR', errors: err.message, data: {}}); 
        })
});

router.get('/gratis/:id', (req, res) => {

    if(!req.params.id) {
        res.status(400).json({ status: 'ERROR', errors: 'Argument "id" must be specified', data: {}});
    }
    var id = req.params.id;
    var url = `${settings.SEXY_MODEL_URL}/${id}`;
    
    service.getModel(url, id)
        .then(function(result) {
            res.status(200).json({ status: 'OK', errors: {}, data: result });
        })
        .catch(err => {
            res.status(400).json({ status: 'ERROR', errors: err.message, data: {}});
        });
});
//#endregion

//#region Videos Gratis
router.get('/videos/gratis', (req, res) => {
    var page = req.query.page;
    var url = settings.VIDEOS_GRATIS;
    if(page != null) {
        url = `${url}/page/${page}`;
    }
    
    service.getModels(url)
        .then((result) => {
            res.status(200).json({ status: 'OK', errors: {}, data: result });
        })
        .catch(err => {
            res.status(400).json({ status: 'ERROR', errors: err.message, data: {}}); 
        })
});

router.get('/videos/gratis/:id', (req, res) => {

    if(!req.params.id) {
        res.status(400).json({ status: 'ERROR', errors: 'Argument "id" must be specified', data: {}});
    }
    var id = req.params.id;
    var url = `${settings.SEXY_MODEL_URL}/${id}`;
    
    service.getModel(url, id)
        .then(function(result) {
            res.status(200).json({ status: 'OK', errors: {}, data: result });
        })
        .catch(err => {
            res.status(400).json({ status: 'ERROR', errors: err.message, data: {}});
        });
});
//#endregion

//#region Sexy Girls
router.get('/girls', (req, res) => {
    var page = req.query.page;
    var url = settings.SEXY_GIRLS_URL;
    if(page != null) {
        url = `${url}/page/${page}`;
    }
    
    service.getModels(url)
        .then((result) => {
            res.status(200).json({ status: 'OK', errors: {}, data: result });
        })
        .catch(err => {
            res.status(400).json({ status: 'ERROR', errors: err.message, data: {}}); 
        })
});

router.get('/girls/:id', (req, res) => {

    if(!req.params.id) {
        res.status(400).json({ status: 'ERROR', errors: 'Argument "id" must be specified', data: {}});
    }
    var id = req.params.id;
    var url = `${settings.SEXY_MODEL_URL}/${id}`;
    
    service.getModel(url, id)
        .then(function(result) {
            res.status(200).json({ status: 'OK', errors: {}, data: result });
        })
        .catch(err => {
            res.status(400).json({ status: 'ERROR', errors: err.message, data: {}});
        });
});
//#endregion

//#region Capas Sexy
router.get('/capas', (req, res) => {
    var page = req.query.page;
    var url = settings.CAPAS_SEXY_URL;
    if(page != null) {
        url = `${url}/page/${page}`;
    }
    
    service.getModels(url)
        .then((result) => {
            res.status(200).json({ status: 'OK', errors: {}, data: result });
        })
        .catch(err => {
            res.status(400).json({ status: 'ERROR', errors: err.message, data: {}}); 
        })
});

router.get('/capas/:id', (req, res) => {

    if(!req.params.id) {
        res.status(400).json({ status: 'ERROR', errors: 'Argument "id" must be specified', data: {}});
    }
    var id = req.params.id;
    var url = `${settings.SEXY_MODEL_URL}/${id}`;
    
    service.getModel(url, id)
        .then(function(result) {
            res.status(200).json({ status: 'OK', errors: {}, data: result });
        })
        .catch(err => {
            res.status(400).json({ status: 'ERROR', errors: err.message, data: {}});
        });
});
//#endregion

//#region Hot Girls
router.get('/hotgirls', function(req, res) {
    var page = req.query.page;
    var url = settings.HOT_GIRLS_URL;
    if(page != null) {
        url = url + '/page/' + page;
    }

    service.getModels(url)
        .then(function(result) {
            res.status(200).json({ status: 'OK', errors: {}, data: result });
        })
        .catch(err => {
            res.status(400).json({ status: 'ERROR', errors: err.message, data: {}});
        });
});

router.get('/hotgirls/:id', function(req, res) {
    if(!req.params.id) {
        res.status(400).json({ status: 'ERROR', errors: 'Argument "id" must be specified', data: {}});
    }
    var id = req.params.id;
    var url = `${settings.SEXY_MODEL_URL}/${id}`;
    
    service.getModel(url, id)
        .then(function(result) {
            res.status(200).json({ status: 'OK', errors: {}, data: result });
        })
        .catch(err => {
            res.status(400).json({ status: 'ERROR', errors: err.message, data: {}});
        });
});
//#endregion

//#region Videos
router.get('/videos', (req, res) => {
    var page = req.query.page;
    var url = settings.VIDEOS_URL;
    if(page != null) {
        url = `${url}/page/${page}`;
    }
    
    service.getModels(url)
        .then((result) => {
            res.status(200).json({ status: 'OK', errors: {}, data: result });
        })
        .catch(err => {
            res.status(400).json({ status: 'ERROR', errors: err.message, data: {}}); 
        })
});

router.get('/videos/:id', (req, res) => {
    if(!req.params.id) {
        res.status(400).json({ status: 'ERROR', errors: 'Argument "id" must be specified', data: {}});
    }
    var id = req.params.id;
    var url = `${settings.SEXY_MODEL_URL}/${id}`;
    
    service.getModel(url, id)
        .then(function(result) {
            res.status(200).json({ status: 'OK', errors: {}, data: result });
        })
        .catch(err => {
            res.status(400).json({ status: 'ERROR', errors: err.message, data: {}});
        });
});
//#endregion

//#region Morenas
router.get('/morenas', function(req, res) {
    var page = req.query.page;
    var url = settings.MORENAS_URL;
    if(page != null) {
        url = url + '/page/' + page;
    }

    service.getModels(url)
        .then(function(result) {
            res.status(200).json({ status: 'OK', errors: {}, data: result });
        })
        .catch(err => {
            res.status(400).json({ status: 'ERROR', errors: err.message, data: {}});
        });
});

router.get('/morenas/:id', function(req, res) {
    if(!req.params.id) {
        res.status(400).json({ status: 'ERROR', errors: 'Argument "id" must be specified', data: {}});
    }
    var id = req.params.id;
    var url = `${settings.SEXY_MODEL_URL}/${id}`;
    service.getModel(url, id)
        .then(function(result) {
            res.status(200).json({ status: 'OK', errors: {}, data: result });
        })
        .catch(err => {
            res.status(400).json({ status: 'ERROR', errors: err.message, data: {}});
        });
});
//#endregion

//#region Loiras
router.get('/loiras', function(req, res) {
    var page = req.query.page;
    var url = settings.LOIRAS_URL;
    if(page != null) {
        url = url + '/page/' + page;
    }

    service.getModels(url)
        .then(function(result) {
            res.status(200).json({ status: 'OK', errors: {}, data: result });
        })
        .catch(err => {
            res.status(400).json({ status: 'ERROR', errors: err.message, data: {}});
        });
});

router.get('/loiras/:id', function(req, res) {
    if(!req.params.id) {
        res.status(400).json({ status: 'ERROR', errors: 'Argument "id" must be specified', data: {}});
    }
    var id = req.params.id;
    var url = `${settings.SEXY_MODEL_URL}/${id}`;
    service.getModel(url, id)
        .then(function(result) {
            res.status(200).json({ status: 'OK', errors: {}, data: result });
        })
        .catch(err => {
            res.status(400).json({ status: 'ERROR', errors: err.message, data: {}});
        });
});
//#endregion

//#region Japonesas
router.get('/japonesas', function(req, res) {
    var page = req.query.page;
    var url = settings.JAPONESAS_URL;
    if(page != null) {
        url = url + '/page/' + page;
    }

    service.getModels(url)
        .then(function(result) {
            res.status(200).json({ status: 'OK', errors: {}, data: result });
        })
        .catch(err => {
            res.status(400).json({ status: 'ERROR', errors: err.message, data: {}});
        });
});

router.get('/japonesas/:id', function(req, res) {
    if(!req.params.id) {
        res.status(400).json({ status: 'ERROR', errors: 'Argument "id" must be specified', data: {}});
    }
    var id = req.params.id;
    var url = `${settings.SEXY_MODEL_URL}/${id}`;    
    service.getModel(url, id)
        .then(function(result) {
            res.status(200).json({ status: 'OK', errors: {}, data: result });
        })
        .catch(err => {
            res.status(400).json({ status: 'ERROR', errors: err.message, data: {}});
        });
});
//#endregion

//#region Mulheres
router.get('/mulheres', function(req, res) {
    var page = req.query.page;
    var url = settings.MULHERES_URL;
    if(page != null) {
        url = url + '/page/' + page;
    }

    service.getModels(url)
        .then(function(result) {
            res.status(200).json({ status: 'OK', errors: {}, data: result });
        })
        .catch(err => {
            res.status(400).json({ status: 'ERROR', errors: err.message, data: {}});
        });
});

router.get('/mulheres/:id', function(req, res) {
    if(!req.params.id) {
        res.status(400).json({ status: 'ERROR', errors: 'Argument "id" must be specified', data: {}});
    }
    var id = req.params.id;
    var url = `${settings.SEXY_MODEL_URL}/${id}`;    
    service.getModel(url, id)
        .then(function(result) {
            res.status(200).json({ status: 'OK', errors: {}, data: result });
        })
        .catch(err => {
            res.status(400).json({ status: 'ERROR', errors: err.message, data: {}});
        });
});
//#endregion

//#region Strip
router.get('/strip', function(req, res) {
    var page = req.query.page;
    var url = settings.STRIP_URL;
    if(page != null) {
        url = url + '/page/' + page;
    }

    service.getModels(url)
        .then(function(result) {
            res.status(200).json({ status: 'OK', errors: {}, data: result });
        })
        .catch(err => {
            res.status(400).json({ status: 'ERROR', errors: err.message, data: {}});
        });
});

router.get('/strip/:id', function(req, res) {
    if(!req.params.id) {
        res.status(400).json({ status: 'ERROR', errors: 'Argument "id" must be specified', data: {}});
    }
    var id = req.params.id;
    var url = `${settings.SEXY_MODEL_URL}/${id}`;    
    service.getModel(url, id)
        .then(function(result) {
            res.status(200).json({ status: 'OK', errors: {}, data: result });
        })
        .catch(err => {
            res.status(400).json({ status: 'ERROR', errors: err.message, data: {}});
        });
});
//#endregion

module.exports = router;
