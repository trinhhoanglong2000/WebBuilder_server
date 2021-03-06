const express = require('express');
const router = express.Router();
const pageController = require('./pageController');
const authenticator = require('../../middleware/authentication');

router.post('/', authenticator.Authenticate, pageController.create);

router.put('/', authenticator.Authenticate, pageController.update);

router.get('/:id/content-url', pageController.getPageContentURL);

router.post('/check-url', pageController.checkURL);
router.delete('/:id', authenticator.Authenticate, pageController.delete);



module.exports = router;