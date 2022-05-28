const http = require('../../const');
const DBHelper = require('../../helper/DBHelper/DBHelper')
exports.getTemplate = async (query) => {
 
    let config = {
        select : "id",
        where: {
            "name" : query.name,
        },
    }
    return DBHelper.FindAll("template",config)
}

exports.getTemplateById = async (query) => {
    return DBHelper.getData("template",query)
}
exports.insertTemplateUser = async (query) => {
    return DBHelper.insertData(query,"account_template",false,null)
}
