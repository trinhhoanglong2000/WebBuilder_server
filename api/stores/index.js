const express = require('express');
const router = express.Router();
const storeController = require('./storeController')

router.get('/', storeController.getStoreByUserId);
router.get('/:id', storeController.getStoreById);
router.get('/:storeId/:pageId/content', storeController.loadContent);

/* POST create account. */
router.post('/create', storeController.createStore);
router.post('/:storeId/:pageId/content', storeController.changeContent);

module.exports = router;