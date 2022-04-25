const DBHelper = require('../../helper/DBHelper/DBHelper');
const AWS = require('aws-sdk');

const s3 = new AWS.S3();

const db = require('../../database');
const { v4: uuidv4 } = require('uuid');

exports.createPage = async (pageBody) => {
    try {
        pageBody.id = uuidv4();

        const s3Result = await s3.upload({
            Body: JSON.stringify("", null, '\t'),
            Bucket: "ezmall-bucket",
            ACL: 'public-read',
            ContentType: 'text/txt',
            Key: `pages/${pageBody.storeId}/${pageBody.id}.txt`
        }).promise();

        const result = await db.query(`
            INSERT INTO pages (id, store_id, name, content_URL) 
            VALUES ($1, $2, $3, $4)
            returning id, "contentURL";
            `, [pageBody.id, pageBody.storeId, pageBody.name, s3Result ? s3Result.Location : ""]);

        return result;
    } catch (error) {
        console.log(error);
        return null;
    }

};

exports.getPagesByStoreId = async (query) => {
    let config = {
        where: {
            "OP.AND": [
                { store_id: query.store_id },
                { name: query.name }
            ]
        }
    }
    return DBHelper.FindAll("pages", config)
};

exports.savePageContent = async (storeId, pageId, content) => {

    try {
        await s3.putObject({
            Body: JSON.stringify(content, null, '\t'),
            Bucket: "ezmall-bucket",
            ContentType: 'text/json',
            ACL: 'public-read',
            Key: `pages/${storeId}/${pageId}.json`
        }).promise();
        return { message: "Update successfully!" };
    } catch (error) {
        console.log(error);
        return null;
    }
};

exports.getPageContentURL = async (pageId) => {
    try {
        const result = await db.query(`
            SELECT content_url 
            FROM pages 
            WHERE (id = '${pageId}')
        `)

        return result.rows[0].contentURL;
    } catch (error) {
        console.log(error);
        return null;
    }
}

exports.findPageById = async (storeId, pageId) => {
    try {
        const data = await s3.getObject({
            Bucket: "ezmall-bucket",
            Key: `pages/${storeId}/${pageId}.json`
        }).promise();
        const content = JSON.parse(data.Body.toString('utf-8'));
        return content;
    } catch (error) {
        console.log(error);
        return null;
    }
};