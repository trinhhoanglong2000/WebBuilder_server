const express = require('express');
const router = express.Router();
const pageController = require('./pageController');

router.post('/create', pageController.create);

router.put('/css/:id', pageController.updateCssFiles);

router.get('/:id', pageController.findPageByStoreId);
router.get('/css/:id', pageController.getCssFiles);


module.exports = router;