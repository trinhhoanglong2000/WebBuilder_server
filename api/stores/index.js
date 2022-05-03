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
router.get('/:id/init-data', authenticator.Authenticate, storeController.getInitDataStore);

/* POST create account. */
router.post('/', authenticator.Authenticate, storeController.createStore);
router.post('/:storeId/:pageId/content', authenticator.Authenticate, storeController.changeContent);
router.post('/trait/:storeId', authenticator.Authenticate, storeController.uploadTraitFile);
router.post('/logoUrl/:storeId', authenticator.Authenticate, storeController.updateLogoUrl);

// POST CREATE PRODUCT
router.post('/:id/products', authenticator.Authenticate, storeController.createProduct)
router.post('/:id/collections', authenticator.Authenticate, storeController.createCollection)
module.exports = router;