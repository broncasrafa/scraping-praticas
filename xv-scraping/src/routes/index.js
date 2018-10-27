var express = require('express')
var router = express.Router();

router.get('/', (req, res) => {
    res.status(200).json({ status: 'OK', errors: {}, data: {}});
});

module.exports = router;