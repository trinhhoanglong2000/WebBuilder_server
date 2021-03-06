const express = require('express');
const router = express.Router();
const productcollectionController = require('./productcollections/productcollectionController')
const bannercollectionController = require('./bannercollections/bannercollectionController')
const authenticator = require('../../middleware/authentication')
//#region carousel
const carouselsController = require('./carousel/carouselsController')
router.get('/carousels',carouselsController.getAllCollections)
router.get('/category/:id',carouselsController.getCategoryData)
//#endregion

router.get('/product', productcollectionController.getAllCollections);
router.get('/product/:id', productcollectionController.getcollectionById);


router.get('/banner', bannercollectionController.getAllCollections);
router.get('/banner/:id', bannercollectionController.getcollectionById);
// router.get('/:id/banners', collectionController.getBannersByCollectionId);


/* POST create account. */
router.post('/product/create', authenticator.Authenticate, productcollectionController.createCollection);
router.post('/banner/create', authenticator.Authenticate, bannercollectionController.createCollection);

// DELETE 
router.delete('/product/:id',authenticator.Authenticate, productcollectionController.deleteProductCollection)
router.put('/product/:id',authenticator.Authenticate,productcollectionController.updateProductCollection)

router.delete('/banner/:id',authenticator.Authenticate, bannercollectionController.deleteBannerCollection)
router.put('/banner/:id',authenticator.Authenticate, bannercollectionController.updateBannerCollection)
module.exports = router;