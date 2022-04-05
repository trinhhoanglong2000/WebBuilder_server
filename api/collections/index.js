const express = require('express');
const router = express.Router();

//#region carousel
const carouselsController = require('./carousel/carouselsController')
router.get('/carousels',carouselsController.getAllCollections)
router.get('/category/:id',carouselsController.getCategoryData)
//#endregion


module.exports = router;