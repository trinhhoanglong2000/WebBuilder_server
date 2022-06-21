const express = require('express');
const router = express.Router();
const orderController = require('./orderController')
const authenticator = require('../../middleware/authentication');

router.get('/:id', orderController.getOrder)
router.delete('/:id', orderController.deleteOrder)
router.post('/:id/change-status', authenticator.Authenticate, orderController.changeOrderStatus);

module.exports = router;