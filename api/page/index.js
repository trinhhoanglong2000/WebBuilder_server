const express = require('express');
const router = express.Router();
const pageController = require('./pageController');

router.post('/create', pageController.create);
router.post('/:pageId/content', pageController.changeContent);

router.get('/', pageController.findPageByUserId);
router.get('/:pageId/content', pageController.loadContent);

module.exports = router;