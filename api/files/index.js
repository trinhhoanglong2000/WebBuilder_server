const express = require('express');
const router = express.Router();
const fileController = require('./fileController')
const aws = require('aws-sdk');
const multer = require('multer');
const multerS3 = require('multer-s3');

const s3 = new aws.S3();

var upload = multer({
    storage: multerS3({
        s3: s3,
        bucket: 'ezmall-bucket',
        acl:'public-read',
        contentType: function (req, file, cb) {
            cb(null, file.mimetype);
        },
        key: function (req, file, cb) {
            cb(null, `assets/${file.originalname}`); //use Date.now() for unique file keys
        }
    })
});

router.post('/asset', upload.array('file'), fileController.uploadAsset)
router.post('/asset/:storeId', fileController.uploadBase64Asset);

router.get('/:filename(*{1,}(\.css|\.js)$)',fileController.getFileName)

module.exports = router;