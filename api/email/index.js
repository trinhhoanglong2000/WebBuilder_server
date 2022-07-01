const express = require('express');
const router = express.Router();
const emailController = require('./emailController')
const authenticator = require('../../middleware/authentication');
router.post('/send-otp', emailController.SendOTP);
router.post('/config-email',authenticator.Authenticate, emailController.configEmail);
router.post('/reset-email',authenticator.Authenticate,emailController.resetEmail)
router.put('/config-email',authenticator.Authenticate,emailController.updateConfigEmail)
router.get('/:id',authenticator.Authenticate,emailController.getConfigEmail)
module.exports = router; 