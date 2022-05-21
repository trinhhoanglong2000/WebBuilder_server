const AWS = require('aws-sdk');

const s3 = new AWS.S3();
const db = require('../../database');
const { v4: uuidv4 } = require('uuid');
const DBHelper = require('../../helper/DBHelper/DBHelper')
const URLParser = require('../../helper/common')

exports.createStore = async (storeObj) => {
    if (storeObj.name) {
        storeObj.name = storeObj.name.trim();
        storeObj.store_link =  URLParser.generateURL(storeObj.name) + '.myeasymall.site';
    }
    return DBHelper.insertData(storeObj, "stores", true)

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

exports.findByUserId = async (query) => {
    let config = {
        where: {
            user_id: query.user_id
        },
        limit: query.limit,
        offset: query.offset
    }
    return DBHelper.FindAll("stores", config)
}

exports.getStoreByName = async (name) => {
    const result = await db.query(`
            SELECT * 
            FROM stores
            WHERE LOWER(name)=LOWER('${name}')
    `)
    return result.rows;
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

exports.uploadStoreComponentsFile = async (storeId, data) => {
    try {
        await s3.putObject({
            Body: JSON.stringify(data),
            Bucket: "ezmall-bucket",
            ACL: 'public-read',
            ContentType: 'text/json',
            Key: `storeComponents/${storeId}.json`
        }).promise();
        return { message: "Update successfully!" };
    } catch (error) {
        console.log(error);
        return null;
    }
}

exports.getStoreComponents = async (storeId) => {
    try {
        const data = await s3.getObject({
            Bucket: "ezmall-bucket",
            Key: `storeComponents/${storeId}.json`
        }).promise();

        const content = JSON.parse(data.Body);
        return content;
    } catch (error) {
        console.log(error);
        return null;
    }
}


exports.getLogo = async (id) => {
    try {
        const result = await db.query(`
            SELECT logo_url 
            FROM stores 
            WHERE (id = '${id}')
        `)
        return result.rows[0];
    } catch (error) {
        console.log(error);
        return null;
    }
}
exports.getTemplate = async (id) => {
    let config = {
        join: {
            "template": {
                condition: {
                    "stores.template_id": "template.id",
                }   
            }
        },
        select: "template.name",
        where: {
            "stores.id": id
        },
        
    }
    const data = await DBHelper.FindAll("stores", config);
    return data[0].name;
}
// join:{
//   template:{
//       condition : {},
//       type:'LEFT'

//   },
//   template1:{

//   }
// }
exports.FindUserAndStore = async (query) => {
    return DBHelper.getData("stores",query)
}