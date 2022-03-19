const express = require('express');
const router = express.Router();
const pageController = require('./pageController');

router.post('/create', pageController.create);
router.post('/:storeId/:pageId/content', pageController.changeContent);

router.put('/update-css/:id', pageController.updateCssFiles);

router.get('/:id', pageController.findPageByStoreId);
router.get('/get-css/:id', pageController.getCssFiles);
router.get('/:storeId/:pageId/content', pageController.loadContent);

module.exports = router;