const express = require('express');
const router = express.Router();
const fileController = require('./fileController')

router.get('/:filename(*{1,}(\.css|\.js)$)',fileController.getFileName)

module.exports = router;