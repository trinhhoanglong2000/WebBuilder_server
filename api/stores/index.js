const express = require('express');
const router = express.Router();
const storeController = require('./storeController')

router.get('/', storeController.getStoreByUserId);
router.get('/:id', storeController.getStoreById);
router.get('/get-css/:id', storeController.getCssFile);

/* POST create account. */
router.post('/create', storeController.createStore);
router.post('/upload-css/:id', storeController.uploadCssFile);
module.exports = router;