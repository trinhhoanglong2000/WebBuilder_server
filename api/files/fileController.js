const http = require('../../const');
const AWS = require('aws-sdk');
const fileService = require('./fileService')
const { v4: uuidv4 } = require('uuid');
const path = require('path');
const s3 = new AWS.S3();

exports.getFileName = async (req, res) =>{
  
    let productionPath = path.join(path.dirname(require.main.filename),'../')
    console.log(path.resolve(__dirname ,`../../`))
    console.log(path.join(__dirname ,`../../`))
    var options = {
        root: productionPath
    }

    res.sendFile(`${req.params.filename}`, {
        root: path.resolve(__dirname ,`../../`)
    })

   
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

exports.uploadProductImageToS3 = async (req, res) => {
    const data = req.body.data.data;
    const path = req.body.data.path
    //    storeImages/:store_id/[products,banners,collections]:
    const result = await fileService.postImage(path, data);
    if (result) {
        res.status(http.Created).json({
            statusCode: http.Created,
            data: result,
            message: "post object successfully!"
        })
    }
    else {
        res.status(http.ServerError).json({
            statusCode: http.ServerError,
            message: "Server error!"
        })
    }
}


exports.deleteObject = async (req, res) => {
    const url = req.body.url;

    const result = await fileService.deleteObject(url);
    if (result) {
        res.status(http.Success).json({
            statusCode: http.Success,
            data: result,
            message: "Delte object successfully!"
        })
    }
    else {
        res.status(http.ServerError).json({
            statusCode: http.ServerError,
            message: "Server error!"
        })
    }
}

exports.uploadImageToS3 = async (req, res) => {
    const data = req.body.data;
    let store_id = req.params.id;
    let result = [];

    for (let item of data) {
        const buf = Buffer.from(item.replace(/^data:image\/\w+;base64,/, ""),'base64');
        const type = item.split(';')[0].split('/')[1];

        result.push(await s3.upload({
            Body: buf,
            Bucket: "ezmall-bucket",
            ContentEncoding: 'base64',
            ContentType: `image/${type}`,
            ACL:'public-read',
            Key: `assets/${store_id}/${uuidv4()}.${type}`
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