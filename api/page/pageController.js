const pageService = require('./pageService');
const AWS = require('aws-sdk');

const s3 = new AWS.S3();

exports.create = async (req, res) => {
    const pageBody = req.body;
    const page = await pageService.createPage(pageBody);
    res.json(page);
};

exports.changeContent = async (req, res) => {
    const pageId = req.params.pageId;
    await s3.putObject({
        Body: JSON.stringify(req.body),
        Bucket: "ezmall-bucket",
        Key: "page2.txt"
    }).promise();
    res.json({message: "OK"});
};

exports.loadContent = async (req, res) => {
    const data =  await s3.getObject({
        Bucket: "ezmall-bucket",
        Key: "page2.txt"
    }).promise();
    const content = JSON.parse(data.Body.toString('utf-8'));
    res.json(content);
}