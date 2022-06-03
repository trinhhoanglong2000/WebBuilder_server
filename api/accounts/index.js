const express = require('express');
const router = express.Router();
const accountController = require('./accountController')
const authenticator = require('../../middleware/authentication');

// router.get('/ecec', accountController.getUserByEmail);

/* POST create account. */
router.get('/',accountController.getUserByEmail)
router.get('/user-info', authenticator.Authenticate, accountController.getUserInfo)
router.put('/change-password', authenticator.Authenticate, accountController.UpdatePassword)
router.post('/updateaccount',accountController.UpdateUser)
module.exports = router;