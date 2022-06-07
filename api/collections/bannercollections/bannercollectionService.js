const db = require('../../../database');
const { v4: uuidv4 } = require('uuid');
const AWS = require('aws-sdk');
const fileService = require('../../files/fileService')
const s3 = new AWS.S3();
const DBHelper = require('../../../helper/DBHelper/DBHelper');
const bannerService = require('../../banners/bannerService')
exports.createCollection = async (collectionObj) => {
    collectionObj.id = uuidv4();
    try {
        if (collectionObj.thumbnail) {
            const buf = Buffer.from(collectionObj.thumbnail.replace(/^data:image\/\w+;base64,/, ""), 'base64');
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

exports.getCollectionsByStoreId = async (query, filter) => {
    //name

    let condition = [];

    condition.push({ store_id: query.store_id })
    if (query.name)
        condition.push({ 'UPPER(name)': { "OP.ILIKE": "%" + query.name.toUpperCase().trim() + "%" } })
    let config = {
        where: {
            "OP.AND": condition,
        },
        limit: query.limit,
        offset: query.offset
    }
    // return DBHelper.getData("productcollections",query)  
    return DBHelper.FindAll("bannercollections", config)
}

exports.findById = async (query) => {

    let config = {
        where: {
            id: query.id
        }
    }
    // return DBHelper.getData("productcollections",query)  
    return DBHelper.FindAll("bannercollections", config)
}

exports.createBannerCollection = async (query) => {
    query.id = uuidv4();

    // upload richtext description to s3
    if (query.description) {
        const body = JSON.stringify(query.description, null, '/t');
        const key = `richtext/bannercollection/${query.id}`
        const rest = await fileService.uploadTextFileToS3(body, key, 'json');

        query.description = rest.Location;
    }
    return DBHelper.insertData(query, "bannercollections", false, "id")
}

exports.getDescription = async (collectionId) => {
    try {
        const data = await s3.getObject({
            Bucket: "ezmall-bucket",
            Key: `richtext/bannercollection/${collectionId}.json`
        }).promise();
        const content = JSON.parse(data.Body.toString('utf-8'));
        return content;
    } catch (error) {
        console.log(error);
        return null;
    }
};

exports.deleteBanner= async (productObj) => {
    let bannerRelativeQuery = {
        bannercollection_id: productObj.id
    }
    await bannerService.deleteBannerRelative("banners", bannerRelativeQuery)

    const key = `richtext/bannercollection/${productObj.id}.json`;
    await fileService.deleteObjectByKey(key)
    return DBHelper.deleteData("bannercollections", productObj)
}

exports.updateBannerCollection = async (query) => {
    if (query.description) {
        const body = JSON.stringify(query.description, null, '/t');
        const key = `richtext/bannercollection/${query.id}`
        const rest = await fileService.uploadTextFileToS3(body, key, 'json');

        query.description = rest.Location;
    }
    return DBHelper.updateData(query,"bannercollections","id")
}