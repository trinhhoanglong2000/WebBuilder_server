const http = require('../../const');
const AWS = require('aws-sdk');
const storeService = require('../stores/storeService');

const s3 = new AWS.S3();

exports.getFileName = async (req, res) =>{
    console.log(req.params.filename);
    res.status(http.Success).sendFile(`${req.params.filename}`,{root:'.'})
}

exports.uploadAsset = async (req, res) => {
    const files = req.files;
    const result = files.reduce((list, item) => {
        list.push(item.location);
        return list;
    }, []);
    
    res.status(http.Success).json({
        statusCode: http.Success,
        data: result,
        message: "Uploaded!"
    });
}

exports.uploadBase64Asset = async (req, res) => {
    const storeId = req.params.storeId;
    const base64Image = req.body.base64Image
    const buf = Buffer.from(base64Image.replace(/^data:image\/\w+;base64,/, ""),'base64');
    const type = base64Image.split(';')[0].split('/')[1];

    const resultS3 = await s3.upload({
        Body: buf,
        Bucket: "ezmall-bucket",
        ContentEncoding: 'base64',
        ContentType: `image/${type}`,
        ACL:'public-read',
        Key: `assets/${storeId}.${type}`
    }).promise();

    if (resultS3) {
        const resultMg = await storeService.updateInfoForOneField('logoURL', resultS3.Location, storeId);
        if (resultMg) {
            res.status(http.Success).json({
                statusCode: http.Success,
                data: resultS3.Location,
                message: "Uploaded!"
            });
            return;
        }
        else {
            res.status(http.ServerError).json({
                statusCode: http.ServerError,
                message: "Server Error!"
            });
        }
        return;
    }

    res.status(http.ServerError).json({
        statusCode: http.ServerError,
        message: "Server Error!"
    });
}