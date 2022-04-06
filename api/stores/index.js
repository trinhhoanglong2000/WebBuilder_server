const express = require('express');
const router = express.Router();
const storeController = require('./storeController')

router.get('/', storeController.getStoreByUserId);
router.get('/:id', storeController.getStoreById);
router.get('/:storeId/:pageId/content', storeController.loadContent);
router.get('/css/:storeId', storeController.getCssFile);
router.get('/:id/pages', storeController.getPagesByStoreId);
router.get('/:id/products', storeController.getProductsByStoreId);
router.get('/:id/collections', storeController.getCollectionsByStoreId);

/* POST create account. */
router.post('/create', storeController.createStore);
router.post('/:storeId/:pageId/content', storeController.changeContent);
router.post('/css/:storeId', storeController.uploadCssFile);

module.exports = router;