const express = require('express');
const authController = require('./authController')
const router = express.Router();

router.post('/google-sign-in', authController.googleSignIn)

router.post('/facebook-sign-in', authController.facebookSignIn)

router.post("/login", authController.signIn);

router.post('/register', authController.createAccount);

router.post('/request-reset-password', authController.requestResetPassword);

router.put('/reset-password', authController.resetPassword);


module.exports = router;