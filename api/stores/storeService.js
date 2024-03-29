const AWS = require('aws-sdk');

const s3 = new AWS.S3();
const db = require('../../database');
const { v4: uuidv4 } = require('uuid');
const DBHelper = require('../../helper/DBHelper/DBHelper')
const URLParser = require('../../helper/common')
const templateService = require('../template/templateService')
const pageService = require('../page/pageService')
const fileService =  require('../files/fileService')
const fse = require('fs-extra');
const { updateStoreData } = require('./storeController');
const { config } = require('dotenv');

exports.createStore = async (storeObj) => {
    if (storeObj.name) {
        storeObj.name = storeObj.name.trim();
        storeObj.store_link = URLParser.generateURL(storeObj.name) + '.myeasymall.site';
        storeObj.original_link = URLParser.generateURL(storeObj.name) + '.myeasymall.site';
        storeObj.mail_link = URLParser.generateURL(storeObj.name) + '@myeasymall.site';
        storeObj.original_mail = URLParser.generateURL(storeObj.name) + '@myeasymall.site';
    }
    let template = await templateService.getTemplate({ name: "Template Default" })
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

exports.getStoreCurrency = async (query) => {
    const config = {
        select : "currency",
        where : {id : query.id}
    }
    return DBHelper.FindAll("stores",config)
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

        if (result.rows.length > 0) {
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


let getStoreLogoById = exports.getStoreLogoById = async (id) => {
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

exports.uploadStoreLogo = async (id, img) => {

    const oldURL = await getStoreLogoById(id).then(res => res.logo_url);
    if (oldURL && oldURL !== 'https://ezmall-bucket.s3.ap-southeast-1.amazonaws.com/DefaultImage/default-image-620x600.png') {
        await fileService.deleteObject(oldURL);
    }

    let location = img
    if (img.substr(0, 5) === 'data:') {
        location = await fileService.uploadImageToS3(`storeImages/${id}/logo/${uuidv4()}`, img);
    }

    try {
        const result = await db.query(`
            UPDATE stores 
            SET logo_url = '${location}'
            WHERE (id = '${id}')
            RETURNING logo_url; 
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
    if (data.length > 0) {
        return data[0].name;
    }
    else {
        return null
    }
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


    // fse.rm(`views/partials/${storeNameConvert}`, { recursive: true, force: true })
    //     .then(() => {
    //         console.log('The file has been deleted!');
    //     })
    //     .catch(err => {
    //         console.error(err)
    //     });
   
    // fse.rm(`views/bodies/${storeNameConvert}`, { recursive: true, force: true })
    //     .then(() => {
    //         console.log('The file has been deleted!');
    //     })
    //     .catch(err => {
    //         console.error(err)
    //     });
    return DBHelper.deleteData("stores", productObj)
}

exports.publishStore = async (storeId) => {
    const storeName = await findById(storeId)
    if (!storeName) {
        return null
    }
    const storeNameConvert = storeName.name ? URLParser.generateURL(storeName.name) : null;

    //Delete old bodies
    await fileService.deleteFolderByKey(`views/bodies/${storeNameConvert}/`)
    // fse.rm(`views/bodies/${storeNameConvert}`, { recursive: true, force: true })
    //     .then(() => {
    //         console.log('The file has been deleted!');
    //     })
    //     .catch(err => {
    //         console.error(err)
    //     });
    
    const allPages = await pageService.getPagesByStoreId({ store_id: storeId })

    let conentList = []
    for (let i = 0; i < allPages.length; i++) {
        const content =  pageService.findPageById(storeId, allPages[i].id)
        conentList.push(content)
    }
    const result_content = await Promise.all(conentList)

    await Promise.all(allPages.map((ele,i)=>{
        return pageService.saveHTMLFile(storeId, allPages[i].id, result_content[i])
    }))

    // Store LOGO
    URLParser.createConfigHTML(storeName.id,storeName.logo_url)
    return true
}

var updateStoreInfo = exports.updateStoreInfo = (storeObj) => {
    return DBHelper.updateData(storeObj, 'stores', 'id');
}

exports.createPaypal = async (storeObj) => {
    const data = await  DBHelper.insertData(storeObj,"store_paypal",false,"id")
    if (data){
        await updateStoreInfo({id: storeObj.id, have_paypal : true })
        return data
    }
    else {
        return null
    }
}

exports.deletePaypal = async (storeObj) => {
    const data = await  DBHelper.deleteData("store_paypal",storeObj)
    if (data){
        await updateStoreInfo({id: storeObj.id, have_paypal : false })
        return data
    }
    else {
        return null
    }
}

exports.getPaypal = async (storeObj) => {
    return DBHelper.getData("store_paypal", storeObj)
}

exports.updatePaypal = async (storeObj) => {
    return DBHelper.updateData(storeObj,"store_paypal", "id")
}

exports.getPaypalStatus = async (storeObj) => {
    const config = {
        select : "have_paypal",
        where : { id : storeObj.id}
    }
    return DBHelper.FindAll("stores", config)
}

