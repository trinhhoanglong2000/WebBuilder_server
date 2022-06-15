const { query } = require('express');
const http = require('../../const');
const DBHelper = require('../../helper/DBHelper/DBHelper')
exports.createVariant = async (query) => {
    return DBHelper.insertData(query,"product_variant",true)
}
exports.updateVariant = async (query) => {
    return DBHelper.updateData(query,"product_variant","id")
}
exports.deleteVariant = async (query) => {
    return DBHelper.deleteData("product_variant",query)
}
exports.getVariant = async (id) => {
    let query = {
        select : "id,name,price,quantity,option_value_id",
        where : {
            product_id : id
        }
    }
    return DBHelper.FindAll("product_variant",query)
}

exports.getVariantById = async (id) => {
    let query = {
        select : "id,name,price,quantity,option_value_id",
        where : {
            id : id
        }
    }
    return DBHelper.FindAll("product_variant",query)
}