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
module.exports = router;