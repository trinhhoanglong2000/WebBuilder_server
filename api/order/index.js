const express = require('express');
const router = express.Router();
const orderController = require('./orderController')
const authenticator = require('../../middleware/authentication');

//router.get('/:id', orderController.getOrder)
router.delete('/:id',authenticator.Authenticate, orderController.deleteOrder)
router.post('/:id/delete-status',authenticator.Authenticate, orderController.deleteOrderStatus)
router.post('/:id/restore-order',authenticator.Authenticate, orderController.restoreOrder)
router.post('/:id/change-status', authenticator.Authenticate, orderController.changeOrderStatus);

module.exports = router;