const db = require('../../database');
const { v4: uuidv4 } = require('uuid');
const AWS = require('aws-sdk');
const DBHelper = require('../../helper/DBHelper/DBHelper')
const s3 = new AWS.S3();

exports.createBanner = async (bannerObj) => {
    return DBHelper.insertData(bannerObj,"banners",true,"id")
}

exports.findAll = async () => {
    try {
        const result = await db.query(`
            SELECT * 
            FROM banners
        `)
    
        return result.rows;
    } catch (error) {
        console.log(error);
        return null;
    }
}

exports.getBannersByCollectionId = async (collectionId) => {
    let config = {
        select : "id, caption, image, link, description",
        where : { bannercollection_id : collectionId},
    }

    return DBHelper.FindAll("banners",config)
}

exports.findById = async (id) => {
    try {
        const result = await db.query(`
            SELECT * 
            FROM banners 
            WHERE (id = '${id}')
        `)
    
        return result.rows[0];
    } catch (error) {
        console.log(error);
        return null;
    }    
}

exports.deleteBannerRelative = async (name, productObj) => {
    return DBHelper.deleteData(`${name}`, productObj)
}
exports.updateBanners = async (query) => {
    return DBHelper.updateData(query,"banners","id")
}