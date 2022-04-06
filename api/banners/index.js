const express = require('express');
const router = express.Router();
const bannerController = require('./bannerController')
const authenticator = require('../../middleware/authentication');

// router.get('/ecec', accountController.getUserByEmail);

router.get('/', bannerController.getAllbanners);
router.get('/:id', bannerController.getBannerById);

/* POST create account. */
router.post('/create', authenticator.Authenticate, bannerController.createBanner);
module.exports = router;