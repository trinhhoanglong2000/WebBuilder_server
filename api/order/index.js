const express = require('express');
const router = express.Router();
const orderController = require('./orderController')
const authenticator = require('../../middleware/authentication');

//router.get('/:id', orderController.getOrder)
router.delete('/:id',authenticator.Authenticate, orderController.deleteOrder)
router.post('/:id/delete-status', orderController.deleteOrderStatus)
router.post('/:id/restore-order',authenticator.Authenticate, orderController.restoreOrder)
router.post('/:id/change-status', authenticator.Authenticate, orderController.changeOrderStatus);
router.post('/:id/change-status-paid', orderController.changeOrderStatusPaid)

router.get('/paypal/capture/:storeId/:orderId', orderController.paypalCaptureOrder);
router.get('/paypal/check/:storeId/:orderId', orderController.paypalCheckOrder);
module.exports = router;