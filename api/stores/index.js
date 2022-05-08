const express = require('express');
const router = express.Router();
const storeController = require('./storeController')
const authenticator = require('../../middleware/authentication');

router.get('/', authenticator.Authenticate, storeController.getStoreByUserId);
router.get('/:id', authenticator.Authenticate, storeController.getStoreById);
router.get('/:storeId/:pageId/content', authenticator.Authenticate, storeController.loadContent);
router.get('/:id/products', storeController.getProductsByStoreId);
router.get('/:id/pages', authenticator.Authenticate, storeController.getPagesByStoreId);
router.get('/:id/collections/product', storeController.getProductCollectionsByStoreId);
router.get('/:id/collections/banner', storeController.getBannerCollectionsByStoreId);
router.get('/:id/store-components', authenticator.Authenticate, storeController.getStoreComponents);
router.get('/:id/init-data', authenticator.Authenticate, storeController.getInitDataStore);

/* POST create account. */
router.post('/', authenticator.Authenticate, storeController.createStore);
router.post('/:storeId/:pageId/content', authenticator.Authenticate, storeController.changeContent);
router.post('/save-store-data/:storeId', authenticator.Authenticate, storeController.updateStoreData);

// POST CREATE PRODUCT
router.post('/:id/products', authenticator.Authenticate, storeController.createProduct)
router.post('/:id/collections', authenticator.Authenticate, storeController.createCollection)
module.exports = router;