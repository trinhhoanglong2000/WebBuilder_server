const http = require('../../const');
const AWS = require('aws-sdk');

const s3 = new AWS.S3();

exports.getFileName = async (req, res) =>{
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

exports.uploadImageToS3 = async (req, res) => {
    const data = req.body.data;
    let result = [];

    for (let item of data) {
        const base64Image = item.base64Image;
        const buf = Buffer.from(base64Image.replace(/^data:image\/\w+;base64,/, ""),'base64');
        const type = base64Image.split(';')[0].split('/')[1];

        result.push(await s3.upload({
            Body: buf,
            Bucket: "ezmall-bucket",
            ContentEncoding: 'base64',
            ContentType: `image/${type}`,
            ACL:'public-read',
            Key: `assets/${item.name}.${type}`
        }).promise());
    };

    result = result.map( (element) => { return element.Location })

    if (result && result.length > 0) {
        return res.status(http.Success).json({
            statusCode: http.Success,
            data: result,
            message: "Uploaded!"
        });
    }

    return res.status(http.ServerError).json({
        statusCode: http.ServerError,
        message: "Server Error!"
    });
    
}