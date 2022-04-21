const http = require('../../const');
const DBHelper = require('../../helper/DBHelper/DBHelper')
exports.createVariant = async (query) => {
    return DBHelper.insertData(query,"product_variant",true)
}