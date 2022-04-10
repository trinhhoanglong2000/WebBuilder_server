const express = require('express');
const router = express.Router();
const pageController = require('./pageController');

router.post('/create', pageController.create);

router.get('/:id/content-url', pageController.getPageContentURL);



module.exports = router;