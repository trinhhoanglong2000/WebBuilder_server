const express = require('express');
const router = express.Router();
const storeController = require('./storeController')

router.get('/', storeController.getStoreByUserId);
router.get('/:id', storeController.getStoreById);
router.get('/:storeId/:pageId/content', storeController.loadContent);
router.get('/:id/products', storeController.getProductsByStoreId);
router.get('/:id/collections/product', storeController.getProductCollectionsByStoreId);
router.get('/:id/collections/banner', storeController.getBannerCollectionsByStoreId);
router.get('/:id/init-data', storeController.getInitDataStore);

/* POST create account. */
router.post('/create', storeController.createStore);
router.post('/:storeId/:pageId/content', storeController.changeContent);
router.post('/css/:storeId', storeController.uploadCssFile);


// POST CREATE PRODUCT
router.post('/:id/products/create', storeController.createProduct)
module.exports = router;