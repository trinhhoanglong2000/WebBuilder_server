const Pages = require('./pageModel');
const mongoose = require('mongoose');
const AWS = require('aws-sdk');

const s3 = new AWS.S3();

const db = require('../../database');
const { v4: uuidv4 } = require('uuid');

exports.createPage = async (pageBody) => {
    try {
        pageBody.id = uuidv4();

        const s3Result = await s3.putObject({
            Body: JSON.stringify("", null, '\t'),
            Bucket: "ezmall-bucket",
            Key: `pages/${pageBody.storeId}/${pageBody.id}.txt`
        }).promise();

        const result = await db.query(`
            INSERT INTO pages (id, "storeId", name, "contentURL") 
            VALUES ($1, $2, $3, $4)
            returning id;
            `, [pageBody.id, pageBody.storeId, pageBody.name, s3Result.Location]);

        return result;
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