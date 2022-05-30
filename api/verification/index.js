const express = require('express');
const router = express.Router();
const verificationController = require('./verificationController')

router.get('/:userId/:uniqueString', verificationController.verify);
router.get('/verified', verificationController.verified);


module.exports = router;