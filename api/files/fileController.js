const http = require('../../const');
const AWS = require('aws-sdk');

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
    const img = new Image();
    const storeId = req.params.storeId;
    img.src = req.body.base64Image;
    console.log(img);

    await s3.putObject({
        Body: JSON.stringify(img.src, null, '\t'),
        Bucket: "ezmall-bucket",
        Key: `asset/${storeId}.txt`
    }).promise();

    res.status(http.Success).json({
        statusCode: http.Success,
        data: result,
        message: "Uploaded!"
    });
}