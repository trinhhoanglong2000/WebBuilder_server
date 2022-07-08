const express = require('express');
const router = express.Router();
const discountController = require('./discountController')
const authenticator = require('../../middleware/authentication');

router.post('/use-discount', discountController.useDiscount);
router.put('/:id', authenticator.Authenticate, discountController.updateDiscount);
router.get('/:id', authenticator.Authenticate, discountController.getDiscount);
router.delete('/:id', authenticator.Authenticate, discountController.deleteDiscount)
router.post("/generate-code", authenticator.Authenticate, discountController.generateCode)
router.post("/check-code", authenticator.Authenticate, discountController.checkCode)

module.exports = router;