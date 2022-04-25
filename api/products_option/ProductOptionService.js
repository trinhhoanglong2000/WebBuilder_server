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
exports.getOptionFromProductId = async (id) =>{
    let query = {
        select : "id,name",
        where : {
            product_id : id
        }
    }
    return DBHelper.FindAll("product_option",query)
}
exports.getDataOptionValue = async (id) => {
    let query = {
        select : "id,value",
        where : {
            
            option_id : id
        }
    }
    return DBHelper.FindAll("product_optionvalue",query)
    
}
exports.getDataOptionValueById = async (id) => {
    let query = {
        select : "id,name,value",
        where : {
            id : id
        }
    }
    return DBHelper.FindAll("product_optionvalue",query)
}