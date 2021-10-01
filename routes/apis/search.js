const searchController = require("../../controllers/search.js")
const router = require("express").Router();

router.get('/search', searchController.search);

module.exports = router;
