var express = require('express');
var router = express.Router();

router.get('/', (req, res) => {
    res.render('pages/index')
})

router.get('/download', (req, res) => {
    res.render('pages/download')
})

module.exports = router;