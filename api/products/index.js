const express = require('express');
const router = express.Router();
const productController = require('./productController')
const authenticator = require('../../middleware/authentication');

// router.get('/ecec', accountController.getUserByEmail);

router.get('/', productController.getAllProducts);
router.get('/:id', productController.getProductById);

/* POST create account. */
router.post('/create', authenticator.Authenticate, productController.createProduct);
module.exports = router;