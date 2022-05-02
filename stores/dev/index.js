const express = require('express');
const router = express.Router();
// const accountController = require('./accountController')

// router.get('/ecec', accountController.getUserByEmail);

/* POST create account. */
router.get('/*', function(req, res) {
    res.send('Welcome to our API!');

});
router.get('/Product', function(req, res) {
    res.send('WonderFulDay');

});
// router.post('/updateaccount',accountController.UpdateUser)
module.exports = router;