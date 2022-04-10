const AWS = require('aws-sdk');

const s3 = new AWS.S3();
const db = require('../../database');
const { v4: uuidv4 } = require('uuid');

exports.createStore = async (storeObj) => {
    try {
        // create
        storeObj.storeLink = storeObj.name.replace(' ', '-').toLowerCase() + '.ezmall.com';

        const result = await db.query(`
            INSERT INTO stores (id, user_id, name, "storeLink", description) 
            VALUES ($1, $2, $3, $4, $5)
            returning id, "storeLink";
            `, [uuidv4(), storeObj.userId, storeObj.name, storeObj.storeLink, storeObj.description]
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
            FROM stores
        `)
    
        return result.rows;
    } catch (error) {
        console.log(error);
        return null;
    }
}

exports.findByUserId = async (userId, filter) => {
    try {
        const result = await db.query(`
            SELECT * 
            FROM stores 
            WHERE (user_id = '${userId}')
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
            FROM stores 
            WHERE (id = '${id}')
        `)
    
        return result.rows[0];
    } catch (error) {
        console.log(error);
        return null;
    }    
}

exports.uploadCssFileForStore = async (storeId, css_body) => {
    try {
        await s3.putObject({
            Body: JSON.stringify(css_body.data),
            Bucket: "ezmall-bucket",
            ACL:'public-read',
            Key: `css/${storeId}.json`
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
        
        const content = data.Body.toString('utf-8');
        return content;
    } catch (error) {
        console.log(error);
        return null;
    }
}


exports.getLogo = (id) => {
    try {
        const result = db.query(`
            SELECT logo_url 
            FROM stores
            WHERE (id = ${id})
        `)
        return result.rows[0];
    } catch (error) {
        console.log(error);
        return null;
    } 
}