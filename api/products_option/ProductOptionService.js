const http = require('../../const');
const DBHelper = require('../../helper/DBHelper/DBHelper')
exports.createDataOption = async (query) => {
    return DBHelper.insertData(query,"product_option",true)
}
exports.createDataOptionValue = async (query) => {
    return DBHelper.insertData(query,"product_optionvalue",true)
}
exports.findDataOptionValue = async (query) => {
    return DBHelper.getData("product_optionvalue",query)
}