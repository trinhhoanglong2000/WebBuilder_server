const express = require('express');
const router = express.Router();
const productController = require('./productController')

// router.get('/ecec', accountController.getUserByEmail);

router.get('/', productController.getAllProducts);
router.get('/:pageId/:id', productController.getProductById);
router.get('/:pageId', productController.getProductByPageId);

/* POST create account. */
router.post('/create', productController.createProduct);
module.exports = router;