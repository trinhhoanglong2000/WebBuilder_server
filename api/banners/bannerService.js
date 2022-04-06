const db = require('../../database');
const { v4: uuidv4 } = require('uuid');
const AWS = require('aws-sdk');

const s3 = new AWS.S3();

exports.createBanner = async (bannerObj) => {
    try {
        if (bannerObj.image) {
            const buf = Buffer.from(bannerObj.image.replace(/^data:image\/\w+;base64,/, ""),'base64');
            const type = bannerObj.image.split(';')[0].split('/')[1];

            const s3Result = await s3.upload({
                Body: buf,
                Bucket: "ezmall-bucket",
                ACL: 'public-read',
                ContentType: `image/${type}`,
                Key: `assets/banners/${bannerObj.id}.${type}`
            }).promise();

            if (s3Result) bannerObj.image = s3Result.Location;
        }
        

        const result = await db.query(`
            INSERT INTO banners (id, collection_id, caption, image, type) 
            VALUES ($1, $2, $3, $4, $5)
            returning id, image;
            `, [uuidv4(), bannerObj.collection_id, bannerObj.caption, bannerObj.image, bannerObj.type]
        );

        return result;
    } catch (error) {
        console.log(error);
        return null;
    }
}

exports.findAll = async () => {
    try {
        const result = await db.query(`
            SELECT * 
            FROM banners
        `)
    
        return result.rows;
    } catch (error) {
        console.log(error);
        return null;
    }
}

exports.getBannersByCollectionId = async (collectionId, filter) => {
    try {
        const result = await db.query(`
            SELECT * 
            FROM banners 
            WHERE (collection_id = '${collectionId}')
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
            FROM banners 
            WHERE (id = '${id}')
        `)
    
        return result.rows[0];
    } catch (error) {
        console.log(error);
        return null;
    }    
}