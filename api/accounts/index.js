const express = require('express');
const router = express.Router();
const accountController = require('./accountController')

// router.get('/ecec', accountController.getUserByEmail);

/* POST create account. */
router.get('/',accountController.getUserByEmail)
router.post('/updateaccount',accountController.UpdateUser)
module.exports = router;