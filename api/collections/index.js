const express = require('express');
const router = express.Router();
const collectionController = require('./collectionController')
const authenticator = require('../../middleware/authentication')

router.get('/', collectionController.getAllCollections);
router.get('/:id', collectionController.getcollectionById);
router.get('/:id/banners', collectionController.getBannersByCollectionId);

/* POST create account. */
router.post('/create', authenticator.Authenticate, collectionController.createcollection);
module.exports = router;