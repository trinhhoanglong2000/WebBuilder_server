const express = require('express');
const router = express.Router();
const templateController = require('./templateController')
const authenticator = require('../../middleware/authentication');

router.get('/free', authenticator.Authenticate, templateController.getFreeTemplate);

module.exports = router;