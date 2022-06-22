const express = require('express');
const router = express.Router();
const dataController = require('./dataController')

router.get('/city', dataController.getCity);
router.get('/city/:id/district', dataController.getDistrict);
module.exports = router;