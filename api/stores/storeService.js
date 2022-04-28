const AWS = require('aws-sdk');

const s3 = new AWS.S3();
const db = require('../../database');
const { v4: uuidv4 } = require('uuid');
const DBHelper = require('../../helper/DBHelper/DBHelper')
exports.createStore = async (storeObj) => {
    if (storeObj.name) {
        storeObj.store_link = storeObj.name.replace(' ', '-').toLowerCase() + '.ezmall.com';
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

exports.uploadTraitFile = async (storeId, data) => {
    console.log(data)
    try {
        await s3.putObject({
            Body: JSON.stringify(data),
            Bucket: "ezmall-bucket",
            ACL: 'public-read',
            ContentType: 'text/json',
            Key: `trait/${storeId}.json`
        }).promise();
        return { message: "Update successfully!" };
    } catch (error) {
        console.log(error);
        return null;
    }
}

exports.getTraitFileForStore = async (storeId) => {
    try {
        const data = await s3.getObject({
            Bucket: "ezmall-bucket",
            Key: `trait/${storeId}.json`
        }).promise();

        console.log(data)

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