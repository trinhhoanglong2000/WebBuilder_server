const AWS = require('aws-sdk');

const s3 = new AWS.S3();
const db = require('../../database');
const { v4: uuidv4 } = require('uuid');
const DBHelper = require('../../helper/DBHelper/DBHelper')
const URLParser = require('../../helper/common')
const templateService = require('../template/templateService')
const pageService = require('../page/pageService')
const fse = require('fs-extra')

exports.createStore = async (storeObj) => {
    if (storeObj.name) {
        storeObj.name = storeObj.name.trim();
        storeObj.store_link = URLParser.generateURL(storeObj.name) + '.myeasymall.site';
    }
    let template = await templateService.getTemplate({ name: "template-default" })
    if (template) {
        storeObj.template_id = template[0].id
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

var findById = exports.findById = async (id) => {
    try {
        const result = await db.query(`
            SELECT * 
            FROM stores 
            WHERE (id = '${id}')
        `)

        if (result.rows.length > 0){
            return result.rows[0];
        }
        else {
            return null
        }
        
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


exports.getStoreLogoById = async (id) => {
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

exports.getStoreNameById = async (id) => {
    try {
        const result = await db.query(`
            SELECT name 
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
    return DBHelper.getData("stores", query)
}

exports.FindStoreByQuery = async (query) => {
    return DBHelper.getData("stores", query)
}

exports.deleteStores = async (productObj) => {
    const storeName = await findById(productObj.id)
    const storeNameConvert = storeName.name ? URLParser.generateURL(storeName.name) : null;


    fse.rm(`views/partials/${storeNameConvert}`, { recursive: true, force: true })
        .then(() => {
            console.log('The file has been deleted!');
        })
        .catch(err => {
            console.error(err)
        });

    fse.rm(`views/bodies/${storeNameConvert}`, { recursive: true, force: true })
        .then(() => {
            console.log('The file has been deleted!');
        })
        .catch(err => {
            console.error(err)
        });
    return DBHelper.deleteData("stores", productObj)
}

exports.publishStore = async (storeId) => {
    const storeName = await findById(storeId)
    if (!storeName){
        return null
    }
    const storeNameConvert = storeName.name ? URLParser.generateURL(storeName.name) : null;


    fse.rm(`views/bodies/${storeNameConvert}`, { recursive: true, force: true })
        .then(() => {
            console.log('The file has been deleted!');
        })
        .catch(err => {
            console.error(err)
        });
    const allPages = await pageService.getPagesByStoreId({ store_id: storeId })
    for (let i = 0; i < allPages.length; i++) {
        const content = await pageService.findPageById(storeId, allPages[i].id)
        await pageService.saveHTMLFile(storeId, allPages[i].id, content)
    }
    return true
}