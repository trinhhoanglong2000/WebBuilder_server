const express = require('express');
const router = express.Router();
const templateController = require('./templateController')
const authenticator = require('../../middleware/authentication');

router.post('/:id/use-template', authenticator.Authenticate, templateController.useTemplate);
router.post('/:id/buy-template', authenticator.Authenticate, templateController.buyTemplate);

router.post('/create-template', authenticator.Authenticate, templateController.createTemplate);
module.exports = router;