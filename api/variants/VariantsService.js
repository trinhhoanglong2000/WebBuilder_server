const http = require('../../const');
const DBHelper = require('../../helper/DBHelper/DBHelper')
exports.createVariant = async (query) => {
    return DBHelper.insertData(query,"product_variant",true)
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