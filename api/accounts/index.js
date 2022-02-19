const express = require('express');
const router = express.Router();
const accountController = require('./accountController')

// router.get('/ecec', accountController.getUserByEmail);

/* POST create account. */
router.post('/create', accountController.createAccount);
module.exports = router;