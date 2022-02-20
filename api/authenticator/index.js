const express = require('express');
const authController = require('./authController')
const router = express.Router();

router.post('/google-sign-in', authController.googleSignIn)

router.post('/facebook-sign-in', authController.facebookSignIn)

router.post("/login", authController.signIn);

router.post('/register', authController.createAccount);


module.exports = router;