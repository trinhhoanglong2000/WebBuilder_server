const db = require('../../database');
const { v4: uuidv4 } = require('uuid');
const DBHelper = require('../../helper/DBHelper/DBHelper')
const fileService = require('../files/fileService')

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
exports.updateProduct = async (productObj) => {
    return DBHelper.updateData(productObj, "products", "id")
}
exports.deleteProduct = async (productObj) => {
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
    let store_Query = {
        store_id: query.store_id
    }
    delete query["store_id"]
    let arr = Object.keys(query)
    let arr1 = Object.values(query)
    //condition.push({ store_id: query.store_id })
    // if (query.title)
    //     condition.push({ title: { "OP.ILIKE": "%" + query.title + "%" } })
    for (let i = 0; i < arr.length; i++) {
        if (arr[i] == "title" || arr[i] == "type") {
            let queryTemp = {}
            queryTemp[`${arr[i]}`] = { "OP.ILIKE": "%" + arr1[i] + "%" }
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
        conditionQuery.push({ "OP.OR": condition })
    }
    let config = {
        where: {
            "OP.AND": conditionQuery,
        },
        limit: query.limit,
        offset: query.offset
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
        select : "DISTINCT vendor",
        where : { store_id : query.store_id},
        order : [{ vendor : "ASC"}]
    }

    return DBHelper.FindAll("products",config)
}