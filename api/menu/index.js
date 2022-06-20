const express = require('express');
const router = express.Router();
const menuController = require('./menuController')
const authenticator = require('../../middleware/authentication');

router.get('/:id', menuController.getMenuItem)

router.post('/', authenticator.Authenticate, menuController.createMenu);

router.put('/', authenticator.Authenticate, menuController.updateMenu);

router.delete('/:id', authenticator.Authenticate, menuController.deleteMenu)
module.exports = router;