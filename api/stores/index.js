const express = require('express');
const router = express.Router();
const storeController = require('./storeController')

router.get('/', storeController.getStoreByUserId);
router.get('/:id', storeController.getStoreById);

/* POST create account. */
router.post('/create', storeController.createStore);
module.exports = router;