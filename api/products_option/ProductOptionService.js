const http = require('../../const');
const DBHelper = require('../../helper/DBHelper/DBHelper')
exports.createDataOption = async (query) => {
    return DBHelper.insertData(query,"product_option",true)
}

exports.updateDataOption = async (query) => {
    return DBHelper.updateData(query,"product_option","id")
}

exports.deleteDataOption = async (query) => {
    return DBHelper.deleteData("product_option",query)
}
exports.createDataOptionValue = async (query) => {
    return DBHelper.insertData(query,"product_optionvalue",true)
}
exports.updateDataOptionValue = async (query,condition) => {
    return DBHelper.updateData(query,"product_optionvalue", `${condition}`)
}
exports.deleteDataOptionValue = async (query) => {
    return DBHelper.deleteData("product_optionvalue",query)
}
exports.findDataOptionValue = async (query) => {
    return DBHelper.getData("product_optionvalue",query)
}
exports.getOptionFromProductId = async (id) =>{
    let query = {
        select : "id,name",
        where : {
            product_id : id
        },
        order : [{rank : "ASC"}]
    }
    return DBHelper.FindAll("product_option",query)
}
exports.getDataOptionValue = async (id) => {
    let query = {
        select : "id,value",
        where : {
            
            option_id : id
        },
        order : [{rank : "ASC"}]
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