const express = require('express');
const router = express.Router();
const fileController = require('./fileController')

router.post('/css/:storeId', fileController.uploadCssFile);

router.get('/css/:storeId', fileController.getCssFile);

router.get('/:filename(*{1,}(\.css|\.js)$)',fileController.getFileName)

module.exports = router;