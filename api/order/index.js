const express = require('express');
const router = express.Router();
const orderController = require('./orderController')
const authenticator = require('../../middleware/authentication');


//router.get('/free', authenticator.Authenticate, templateController.getFreeTemplate);

module.exports = router;