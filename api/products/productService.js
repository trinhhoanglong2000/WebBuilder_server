const db = require('../../database');
const { v4: uuidv4 } = require('uuid');
const DBHelper = require('../../helper/DBHelper/DBHelper')
const fileService = require('../files/fileService')

const variantService = require('../variants/VariantsService')
const AWS = require('aws-sdk');
const s3 = new AWS.S3();
exports.createProduct = async (productObj) => {
    productObj.id = uuidv4();

    // upload richtext description to s3
    if (productObj.description) {
        const body = JSON.stringify(productObj.description, null, '/t');
        const key = `richtext/product/${productObj.id}`
        const rest = await fileService.uploadTextFileToS3(body, key, 'json');

        productObj.description = rest.Location;
    }
    return DBHelper.insertData(productObj, "products", false, "id")
}
var updateProduct = exports.updateProduct = async (productObj) => {
    if (productObj.description) {
        const body = JSON.stringify(productObj.description, null, '/t');
        const key = `richtext/product/${productObj.id}`
        const rest = await fileService.uploadTextFileToS3(body, key, 'json');

        productObj.description = rest.Location;
    }
    const today = new Date()
    const date = today.getUTCFullYear() + '-' + (today.getUTCMonth() + 1) + '-' + today.getUTCDate();
    const time = today.getUTCHours() + ":" + today.getUTCMinutes() + ":" + today.getUTCSeconds();
    const dateTime = date + ' ' + time;
    productObj.update_at = dateTime
    return DBHelper.updateData(productObj, "products", "id")
}
exports.deleteProduct = async (productObj) => {
    const key = `richtext/product/${productObj.id}.json`;
    await fileService.deleteObjectByKey(key)
    return DBHelper.deleteData("products", productObj)
}
exports.deleteProductRelative = async (name, productObj) => {
    return DBHelper.deleteData(`${name}`, productObj)
}
exports.findAll = async () => {
    try {
        const result = await db.query(`
            SELECT * 
            FROM products
        `)

        return result.rows;
    } catch (error) {
        console.log(error);
        return null;
    }
}

exports.getProductsByStoreId = async (query) => {
    let condition = [];
    let offset = query.offset
    let limit = query.limit
    const collectionId = query.collection_id
    if (collectionId){
        delete query["collection_id"]
    }
    let store_Query = {
        store_id: query.store_id
    }
    if (query.offset) {
        delete query["offset"]
    }

    if (query.limit) {
        delete query["limit"]
    }
    delete query["store_id"]
    let arr = Object.keys(query)
    let arr1 = Object.values(query)

    for (let i = 0; i < arr.length; i++) {
        if (arr[i] == "title" || arr[i] == "type") {
            let queryTemp = {}
            queryTemp[`UPPER(${arr[i]})`] = { "OP.ILIKE": "%" + arr1[i].toUpperCase().trim() + "%" }
            condition.push(queryTemp)
        }
        else {
            let queryTemp = {}
            queryTemp[`${arr[i]}`] = arr1[i]
            condition.push(queryTemp)
        }

    }

    let conditionQuery = [store_Query]
    if (condition.length > 0) {
        conditionQuery.push({ "OP.AND": condition })
    }
    
    if (collectionId){
        conditionQuery.push({"products.id" : {"OP.NORMAL" : "product_productcollection.product_id"}})
    }

   
    let config = {
        
        where: {
            "OP.AND": conditionQuery,
        },
        limit: limit,
        offset: offset
    }
    if (collectionId){
        config.join = {
            "product_productcollection": {
                condition: {
                    "product_productcollection.productcollection_id": `'${collectionId}'`,
                }   
            }
        }
    }
    // let config = {
    //     where: {
    //         store_id : query.store_id
    //     },
    //     limit : query.limit,
    //     offset: query.offset
    // }
    return DBHelper.FindAll("products", config)
}

exports.getProductsWithVariantByStoreId = async (query) => {
    let condition = [];
    let offset = query.offset
    let limit = query.limit
    
    let store_Query = {
        store_id: query.store_id
    }
    if (query.offset) {
        delete query["offset"]
    }

    if (query.limit) {
        delete query["limit"]
    }
    delete query["store_id"]
    let arr = Object.keys(query)
    let arr1 = Object.values(query)

    for (let i = 0; i < arr.length; i++) {
        if (arr[i] == "title" || arr[i] == "type") {
            let queryTemp = {}
            queryTemp[`UPPER(${arr[i]})`] = { "OP.ILIKE": "%" + arr1[i].toUpperCase().trim() + "%" }
            condition.push(queryTemp)
        }
        else {
            let queryTemp = {}
            queryTemp[`${arr[i]}`] = arr1[i]
            condition.push(queryTemp)
        }

    }

    let conditionQuery = [store_Query]
    if (condition.length > 0) {
        conditionQuery.push({ "OP.AND": condition })
    }
    
    let config = {
        
        where: {
            "OP.AND": conditionQuery,
        },
        limit: limit,
        offset: offset
    }
   
    const returnData = await DBHelper.FindAll("products", config)
    for (let i = 0; i < returnData.length; i++){
        const variant = await variantService.getVariant(returnData[i].id)
        returnData[i].variants = variant
    }
    return returnData
}

exports.findById = async (id) => {
    let query = {
        id: id
    }
    return DBHelper.getData("products", query)
}
exports.getProductsByCollectionId = async (collectionId, data) => {
    try {
        let arr = Object.keys(data)
        let arr1 = Object.values(data)
        for (var i = 0; i < arr1.length; i++) {
            arr1[i] = "'" + arr1[i] + "'"
            arr[i] = "a." + arr[i]
        }
        if (arr.length != 0) {
            const result = await db.query(`
                SELECT * 
                FROM products as a JOIN product_productcollection as b
                ON a.id = b.product_id 
                WHERE (b.productcollection_id = '${collectionId}') 
                AND (${arr}) = (${arr1})
            `)
            return result.rows;
        }
        else {
            const result = await db.query(`
                SELECT * 
                FROM products as a JOIN product_productcollection as b
                ON a.id = b.product_id 
                WHERE (b.productcollection_id = '${collectionId}') 
            `)
            return result.rows;
        }
    } catch (error) {
        console.log(error);
        return null;
    }
}


exports.getAllCustomType = async (query) => {
    try {
        console.log(`
        SELECT DISTINCT type
        FROM products
        WHERE store_id = ${query.store_id} AND custom_type = ${query.custom_type}
        ORDER BY type
    `)
        const result = await db.query(`
                SELECT DISTINCT type
                FROM products
                WHERE store_id = '${query.store_id}' AND custom_type = ${query.custom_type}
                ORDER BY type
            `)
        return result.rows;


    } catch (error) {
        console.log(error);
        return null;
    }
}

exports.getVendor = async (query) => {
    let config = {
        select: "DISTINCT vendor",
        where: { store_id: query.store_id },
        order: [{ vendor: "ASC" }]
    }

    return DBHelper.FindAll("products", config)
}

exports.getDescription = async (productId) => {
    try {
        const data = await s3.getObject({
            Bucket: "ezmall-bucket",
            Key: `richtext/product/${productId}.json`
        }).promise();
        const content = JSON.parse(data.Body.toString('utf-8'));
        return content;
    } catch (error) {
        console.log(error);
        return null;
    }
};

var updateInventoryFromVariants = exports.updateInventoryFromVariants = async (id) => {
    const variant = await variantService.getVariant(id)
    let total = 0
    for (let i = 0; i < variant.length; i++) {
        total += variant[i].quantity
    }
    await updateProduct({ id: id, inventory: total })
}

exports.updateInventory = async (query) => {
    let result
    if (query.is_variant){
        const variantQuery = {
            id : query.variant_id,
            quantity: query.quantity
        }
        result = await variantService.updateVariant(variantQuery)
        await  updateInventoryFromVariants(query.id)
    }
    else {
        const productQuery = {
            id : query.id,
            inventory : query.quantity
        }
        result = await updateProduct(productQuery)
        
    }
    return result
}