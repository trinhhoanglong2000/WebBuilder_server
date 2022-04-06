const db = require('../../database');
const { v4: uuidv4 } = require('uuid');

exports.createProduct = async (productObj) => {
    try {
        const result = await db.query(`
        INSERT INTO products (id, "storeId", title, type, status, thumbnail, price, inventory, images) 
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
        returning id;
        `, [uuidv4(), productObj.storeId, productObj.title, productObj.type, productObj.status, productObj.thumbnail, productObj.price, productObj.inventory, productObj.images]
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
            WHERE ("storeId" = '${storeId}')
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