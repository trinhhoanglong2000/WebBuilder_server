const express = require('express');
const router = express.Router();
const storeController = require('./storeController')
const authenticator = require('../../middleware/authentication');

router.get('/', authenticator.Authenticate, storeController.getStoreByUserId);
router.get('/:id', authenticator.Authenticate, storeController.getStoreById);
router.get('/is-exist/:name', storeController.getStoreByName);
router.get('/:storeId/:pageId/content', authenticator.Authenticate, storeController.loadContent);

router.get('/:id/products', storeController.getProductsByStoreId);
router.get('/:id/products-variant', storeController.getProductsWithVariantByStoreId);

router.get('/:id/pages', authenticator.Authenticate, storeController.getPagesByStoreId);
router.get('/:id/pages/policy', authenticator.Authenticate, storeController.getPagesPolicy);
router.get('/:id/page/:name', storeController.getPageByName);

router.get('/:id/collections/product', storeController.getProductCollectionsByStoreId);
router.get('/:id/collections/banner', storeController.getBannerCollectionsByStoreId);

router.get('/:id/store-components', authenticator.Authenticate, storeController.getStoreComponents);
router.get('/:id/menu', storeController.getMenuByStoreId);
router.get('/:id/list-menu-items', storeController.getListMenuItems);
router.get('/:id/init-data', authenticator.Authenticate, storeController.getInitDataStore);
router.get('/:id/products/custom-type',authenticator.Authenticate, storeController.getCustomType);
router.get('/:id/products/vendor', authenticator.Authenticate, storeController.getVendor);
router.get('/:id/headerData', storeController.getHeaderData);
router.get('/:id/orders',authenticator.Authenticate, storeController.getOrderByStore)
router.get('/:id/order/:orderId', storeController.getOrderById)

router.get('/:id/discounts',authenticator.Authenticate, storeController.getDiscountByStoreId)
router.post('/:id/active-discounts',authenticator.Authenticate, storeController.getActiveDiscountByStoreId)
router.get('/:id/discount/:discountId', storeController.getDiscountById)
//TEMPLATE
router.get('/:id/current-template', authenticator.Authenticate, storeController.getCurrentTemplateByStore);
router.get('/:id/paid-templates', authenticator.Authenticate, storeController.getPaidTemplateByStore);
router.get('/:id/free-templates',authenticator.Authenticate, storeController.getFreeTemplateByStore);
router.get('/:id/stores-templates',authenticator.Authenticate, storeController.getTemplatesByStore)
/* POST create account. */
router.post('/', authenticator.Authenticate, storeController.createStore);
router.post('/:storeId/:pageId/content', authenticator.Authenticate, storeController.changeContent);
router.post('/save-store-data/:storeId', authenticator.Authenticate, storeController.updateStoreData);

// POST CREATE PRODUCT
router.post('/:id/products', authenticator.Authenticate, storeController.createProduct);
router.post('/:id/collections', authenticator.Authenticate, storeController.createCollection);
router.post('/:id/bannercollections', authenticator.Authenticate, storeController.createBannerCollection);

// POST CREATE ORDER
router.post('/:id/order',storeController.createOrder)
router.post('/:id/discount', authenticator.Authenticate, storeController.createDiscount)
//DELETE STORE
router.delete('/:id',authenticator.Authenticate, storeController.deleteStore)

//ROUTER PUBLISH STORE
router.post('/:id/publish',authenticator.Authenticate, storeController.publishStore)

// SEND CONTACT FORM
router.post('/:id/contact-form', storeController.sendContact)
//Update store info
router.put('/', authenticator.Authenticate, storeController.updateStoreInfo);


//GET ANALYST
router.get('/:id/total-orders', authenticator.Authenticate, storeController.totalOrder)
router.get('/:id/average-orders-value', authenticator.Authenticate, storeController.averageTotalOrder)
module.exports = router;

// GET MAIL
router.get('/:id/user-mail', storeController.getMailByStoreId);

//PAYPAL

router.get('/:id/paypal',authenticator.Authenticate, storeController.getPaypal);
router.delete('/:id/paypal',authenticator.Authenticate, storeController.deletePaypal);
router.put('/:id/paypal',authenticator.Authenticate, storeController.updatePaypal);
router.post('/:id/paypal',authenticator.Authenticate, storeController.createPaypal);

router.get('/:id/paypal-status', storeController.getPaypalStatus);

//CURRENCY

router.get('/:id/currency',storeController.getCurrency)
router.post('/:id', authenticator.Authenticate, storeController.updateStore)