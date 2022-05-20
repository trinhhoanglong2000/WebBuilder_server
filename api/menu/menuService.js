const DBHelper = require('../../helper/DBHelper/DBHelper')

exports.createMenu = async (menuObj) => {
    return DBHelper.insertData(menuObj, "menu", true)
}

exports.getMenuById = async (query) => {
    let config = {
        where: {
            id: query.id
        },
        limit: query.limit,
        offset: query.offset
    }
    return DBHelper.FindAll("menu", config)
}

exports.getMenuByStoreId = async (query) => {
    let config = {
        where: {
            store_id: query.store_id
        },
        limit: query.limit,
        offset: query.offset
    }
    return DBHelper.FindAll("menu", config)
}

exports.updateMenu = async (menuObj) => {
    return DBHelper.updateData(menuObj, 'menu', 'id')
}