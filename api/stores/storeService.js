const mongoose = require('mongoose');
const Store = require('./storeModel');
const AWS = require('aws-sdk');

const s3 = new AWS.S3();

exports.createStore = (storeObj) => {
    try {
        // create
        storeObj._id = mongoose.Types.ObjectId();
        storeObj.userId = mongoose.Types.ObjectId(storeObj.userId);
        storeObj.storeLink = storeObj.name.replace(' ', '-').toLowerCase() + '.ezmall.com';
        const store = new Store(storeObj);
        return store.save();
    } catch (error) {
        console.log(error);
        return null;
    }
}

exports.findAll = () => {
    try {
        const stores = Product.find({}).limit(20);
        return stores;
    } catch (error) {
        console.log(error);
        return null;
    }
}

exports.findByUserId = (userId, filter) => {
    try {
        
        filter.userId = mongoose.Types.ObjectId(userId)
        console.log(filter);
        const stores = Store.find(filter).limit(20);
        return stores;
    } catch (error) {
        console.log(error);
        return null;
    }
}

exports.findById = (id) => {
    try {
        const store = Store.findById(id)
        return store;
    } catch (error) {
        console.log(error);
        return null;
    }    
}

exports.uploadCssFileForStore = async (storeId, css_body) => {
    try {
        await s3.putObject({
            // Body: JSON.stringify(css_body, null, '\t'),
            Body: css_body.data,
            Bucket: "ezmall-bucket",
            ContentType: "text/css",
            ACL:'public-read',
            Key: `css/${storeId}.css`
        }).promise();
        return {message: "Update successfully!"};
    } catch (error) {
        console.log(error);
        return null;
    }
}

exports.getCssFileForStore = async (storeId) => {
    try {
        const data =  await s3.getObject({
            Bucket: "ezmall-bucket",
            Key: `css/${storeId}.css`
        }).promise();
        console.log(data)
        const content = data.Body.toString('utf-8');
        return content;
    } catch (error) {
        console.log(error);
        return null;
    }
}

exports.updateInfoForOneField = (fieldNeedUpdate, data, storeId) => {
    try {
        let fieldToUpdate = {
            [fieldNeedUpdate]: data
        }
        const store = Store.findByIdAndUpdate(storeId, {$set: fieldToUpdate})
        return store;
    } catch (error) {
        console.log(error);
        return null;
    }
}

exports.getLogo = (id) => {
    try {
        const logo = Store.findOne({_id: id}, 'logoUrl');
        return logo;
    } catch (error) {
        console.log(error);
        return null;
    } 
}