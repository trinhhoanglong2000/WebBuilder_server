const express = require('express');
const router = express.Router();
const dataController = require('./dataController')

router.get('/city', dataController.getCity);
router.get('/city/:id/district', dataController.getDistrict);
router.post('/convert-money', dataController.convertMoney);
router.get('/rate', dataController.getRate);
module.exports = router;