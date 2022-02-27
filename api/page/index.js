const express = require('express');
const router = express.Router();
const pageController = require('./pageController');

router.post('/create', pageController.create);
router.post('/:storeId/:pageId/content', pageController.changeContent);

router.get('/:id', pageController.findPageByStoreId);
router.get('/:storeId/:pageId/content', pageController.loadContent);

module.exports = router;