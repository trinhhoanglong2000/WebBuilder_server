const express = require('express');
const router = express.Router();
const emailController = require('./emailController')

router.post('/send-otp', emailController.SendOTP);

module.exports = router;