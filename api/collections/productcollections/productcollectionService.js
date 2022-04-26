const db = require('../../../database');
const { v4: uuidv4 } = require('uuid');
const AWS = require('aws-sdk');
const DBHelper = require('../../../helper/DBHelper/DBHelper');
const { collection } = require('../../accounts/accountModel');
const { query } = require('express');
const s3 = new AWS.S3();

exports.createCollection = async (collectionObj) => {
    try {
        if (collectionObj.thumbnail) {
            const buf = Buffer.from(collectionObj.thumbnail.replace(/^data:image\/\w+;base64,/, ""), 'base64');
            const type = collectionObj.thumbnail.split(';')[0].split('/')[1];

            const s3Result = await s3.upload({
                Body: buf,
                Bucket: "ezmall-bucket",
                ACL: 'public-read',
                ContentType: `image/${type}`,
                Key: `assets/collections/product/${collectionObj.id}.${type}`
            }).promise();

            if (s3Result) collectionObj.thumbnail = s3Result.Location;
        }

        return DBHelper.insertData(collectionObj, "productcollections", true)
    } catch (error) {
        console.log(error);
        return null;
    }
}

exports.findAll = async () => {
    return DBHelper.getData("productcollections")
}

exports.getCollectionsByStoreId = async (storeId, filter) => {
    try {
        const result = await db.query(`
            SELECT * 
            FROM productcollections 
            WHERE ("storeId" = '${storeId}')
        `)

        return result.rows;
    } catch (error) {
        console.log(error);
        return null;
    }
}

exports.findById = async (query) => {
    
    let config = {
        where: {
            id: query.id
        }
    }
    // return DBHelper.getData("productcollections",query)  
    return DBHelper.FindAll("productcollections",config)
}
exports.getData = async (query) => {
    //name

    let condition =[];
    
    condition.push({store_id : query.store_id})
    if (query.name)
        condition.push({name:{"OP.ILIKE" : "%" + query.name + "%"}})
    let config = {
        where: {
            "OP.AND" : condition,
        },
        limit : query.limit,
        offset: query.offset
    }
    // return DBHelper.getData("productcollections",query)  
    return DBHelper.FindAll("productcollections",config)
}

exports.createProductandCollectionLink = async (query) => {
    return DBHelper.insertData(query,"product_productcollection",false)
}