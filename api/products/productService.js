const db = require('../../database');
const { v4: uuidv4 } = require('uuid');
const DBHelper = require('../../helper/DBHelper/DBHelper')
exports.createProduct = async (productObj) => {
    return DBHelper.insertData(productObj, "products", true)
}
exports.updateProduct = async (productObj) => {
    return DBHelper.updateData(productObj,"products","id")
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

exports.getProductsByStoreId = async (storeId, filter) => {
    try {
        const result = await db.query(`
            SELECT * 
            FROM products 
            WHERE store_id = '${storeId}')
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
            FROM products 
            WHERE (id = '${id}')
        `)

        return result.rows[0];
    } catch (error) {
        console.log(error);
        return null;
    }
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
