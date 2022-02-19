const Pages = require('./pageModel');
const mongoose = require('mongoose');
const AWS = require('aws-sdk');

const s3 = new AWS.S3();

exports.createPage = (pageBody) => {
    try {
        pageBody._id = mongoose.Types.ObjectId();
        pageBody.userId = mongoose.Types.ObjectId(pageBody.userId);
        const page = new Pages(pageBody);
        return page.save();
    } catch (error) {
        console.log(error);
        return null;
    }
    
};

exports.findPageByUserId = (userId) => {
    try {
        return Pages.find({userId: mongoose.Types.ObjectId(userId)});
    } catch (error) {
        console.log(error);
        return null;
    }
};

exports.savePageContent = async (pageId, content) => {
    try {
        await s3.putObject({
            Body: JSON.stringify(content, null, '\t'),
            Bucket: "ezmall-bucket",
            Key: "page2.txt"
        }).promise();
        return {message: "Update successfully!"};
    } catch (error) {
        console.log(error);
        return null;
    }
};

exports.findPageById = async (pageId) => {
    try {
        const data =  await s3.getObject({
            Bucket: "ezmall-bucket",
            Key: "page2.txt"
        }).promise();
        const content = JSON.parse(data.Body.toString('utf-8'));
        return content;
    } catch (error) {
        console.log(error);
        return null;
    }
};