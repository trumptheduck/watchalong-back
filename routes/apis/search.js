const searchController = require("../../controllers/search.js")
const scraperController = require("../../controllers/scraper.js")
const router = require("express").Router();

router.get('/search', searchController.search);
router.post('/next', searchController.nextPage);
router.get('/getlink', scraperController.getMovieLink);
module.exports = router;
