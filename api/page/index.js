const express = require('express');
const router = express.Router();
const pageController = require('./pageController');

router.post('/create', pageController.create);

router.get('/:id', pageController.findPageByStoreId);


module.exports = router;