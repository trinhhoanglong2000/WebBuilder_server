const Pages = require('./pageModel');
const mongoose = require('mongoose');
const AWS = require('aws-sdk');

const s3 = new AWS.S3();

exports.createPage = async (pageBody) => {
    try {
        pageBody._id = mongoose.Types.ObjectId();
        pageBody.storeId = mongoose.Types.ObjectId(pageBody.storeId);
        const page = new Pages(pageBody);
        await s3.putObject({
            Body: JSON.stringify("", null, '\t'),
            Bucket: "ezmall-bucket",
            Key: `pages/${pageBody.storeId}/${pageBody._id}.txt`
        }).promise();
        return page.save();
    } catch (error) {
        console.log(error);
        return null;
    }
    
};

exports.findPageByStoreId = (storeId) => {
    try {
        return Pages.find({storeId: mongoose.Types.ObjectId(storeId)});
    } catch (error) {
        console.log(error);
        return null;
    }
};

exports.savePageContent = async (storeId, pageId, content) => {
    try {
        await s3.putObject({
            Body: JSON.stringify(content, null, '\t'),
            Bucket: "ezmall-bucket",
            Key: `pages/${storeId}/${pageId}.txt`
        }).promise();
        return {message: "Update successfully!"};
    } catch (error) {
        console.log(error);
        return null;
    }
};

exports.findPageById = async (storeId, pageId) => {
    try {
        const data =  await s3.getObject({
            Bucket: "ezmall-bucket",
            Key: `pages/${storeId}/${pageId}.txt`
        }).promise();
        const content = JSON.parse(data.Body.toString('utf-8'));
        return content;
    } catch (error) {
        console.log(error);
        return null;
    }
};

exports.getCssFiles = async (pageId) => {
    try {
        return Pages.findById(pageId, 'cssFiles');
    } catch (error) {
        console.log(error);
        return null;
    }
}

exports.updateCssFiles = async (pageId, list) => {
    try {
        return Pages.findByIdAndUpdate(pageId, { cssFiles: list });
    } catch (error) {
        console.log(error);
        return null;
    }
}