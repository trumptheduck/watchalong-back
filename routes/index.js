const router = require('express').Router();

router.use('/apis', require('./apis/search.js'));

module.exports = router;
