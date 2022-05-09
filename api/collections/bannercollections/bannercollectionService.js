const db = require('../../../database');
const { v4: uuidv4 } = require('uuid');
const AWS = require('aws-sdk');

const s3 = new AWS.S3();

exports.createCollection = async (collectionObj) => {
    collectionObj.id = uuidv4();
    try {
        if (collectionObj.thumbnail) {
            const buf = Buffer.from(collectionObj.thumbnail.replace(/^data:image\/\w+;base64,/, ""),'base64');
            const type = collectionObj.thumbnail.split(';')[0].split('/')[1];

            const s3Result = await s3.upload({
                Body: buf,
                Bucket: "ezmall-bucket",
                ACL: 'public-read',
                ContentType: `image/${type}`,
                Key: `assets/collections/banner/${collectionObj.id}.${type}`
            }).promise();

            if (s3Result) collectionObj.thumbnail = s3Result.Location;
        }
        

        const result = await db.query(`
            INSERT INTO bannercollections (id, store_id, name, description, thumbnail) 
            VALUES ($1, $2, $3, $4, $5)
            returning id, thumbnail;
            `, [collectionObj.id, collectionObj.storeId, collectionObj.name, collectionObj.description, collectionObj.thumbnail]
        );

        return result.rows[0];
    } catch (error) {
        console.log(error);
        return null;
    }
}

exports.findAll = async () => {
    try {
        const result = await db.query(`
            SELECT * 
            FROM bannercollections
        `)
    
        return result.rows;
    } catch (error) {
        console.log(error);
        return null;
    }
}

exports.getCollectionsByStoreId = async (storeId, filter) => {
    try {
        const result = await db.query(`
            SELECT * 
            FROM bannercollections 
            WHERE ("storeId" = '${storeId}')
        `)
    
        return result.rows;
    } catch (error) {
        console.log(error);
        return null;
    }
}

exports.findById = async (id) => {
    try {
        const result = await db.query(`
            SELECT * 
            FROM bannercollections 
            WHERE (id = '${id}')
        `)
    
        return result.rows[0];
    } catch (error) {
        console.log(error);
        return null;
    }    
}