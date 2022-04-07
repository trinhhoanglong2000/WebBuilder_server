const express = require('express');
const router = express.Router();
const productcollectionController = require('./productcollections/productcollectionController')
const bannercollectionController = require('./bannercollections/bannercollectionController')
const authenticator = require('../../middleware/authentication')

<<<<<<< HEAD

//#region carousel
const carouselsController = require('./carousel/carouselsController')
router.get('/carousels',carouselsController.getAllCollections)
router.get('/category/:id',carouselsController.getCategoryData)
//#endregion


router.get('/', collectionController.getAllCollections);
router.get('/:id', collectionController.getcollectionById);
router.get('/:id/banners', collectionController.getBannersByCollectionId);
=======
router.get('/product', productcollectionController.getAllCollections);
router.get('/product/:id', productcollectionController.getcollectionById);

router.get('/banner', bannercollectionController.getAllCollections);
router.get('/banner/:id', bannercollectionController.getcollectionById);
// router.get('/:id/banners', collectionController.getBannersByCollectionId);
>>>>>>> abe80d492376644c7ca1c555d8d53c4691566c2b


/* POST create account. */
router.post('/product/create', authenticator.Authenticate, productcollectionController.createCollection);
router.post('/banner/create', authenticator.Authenticate, bannercollectionController.createCollection);
module.exports = router;