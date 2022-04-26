const express = require('express');
const router = express.Router();
const storeController = require('./storeController')

router.get('/', storeController.getStoreByUserId);
router.get('/:id', storeController.getStoreById);
router.get('/:storeId/:pageId/content', storeController.loadContent);
router.get('/:id/products', storeController.getProductsByStoreId);
router.get('/:id/pages', storeController.getPagesByStoreId);
router.get('/:id/collections/product', storeController.getProductCollectionsByStoreId);
router.get('/:id/collections/banner', storeController.getBannerCollectionsByStoreId);
router.get('/:id/init-data', storeController.getInitDataStore);

/* POST create account. */
router.post('/', storeController.createStore);
router.post('/:storeId/:pageId/content', storeController.changeContent);
router.post('/css/:storeId', storeController.uploadCssFile);
router.post('/logoUrl/:storeId', storeController.updateLogoUrl);

// POST CREATE PRODUCT
router.post('/:id/products', storeController.createProduct)
router.post('/:id/collections', storeController.createCollection)
module.exports = router;