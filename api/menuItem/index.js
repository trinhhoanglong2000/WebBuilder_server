const express = require('express');
const router = express.Router();
const menuItemController = require('./menuItemController')
const authenticator = require('../../middleware/authentication');

router.post('/', authenticator.Authenticate, menuItemController.createMenuItem);

router.put('/', authenticator.Authenticate, menuItemController.updateMenuItem);

router.put('/sub-menu', authenticator.Authenticate, menuItemController.updateSubMenuItem);
router.delete('/:id', authenticator.Authenticate, menuItemController.deleteMenuItem);

module.exports = router;