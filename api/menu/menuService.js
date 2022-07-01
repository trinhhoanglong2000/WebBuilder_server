const DBHelper = require('../../helper/DBHelper/DBHelper')
const menuItemService = require('../menuItem/menuItemService')
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

exports.deleteMenu = async (menuObj) => {
    await menuItemService.deleteMenuItem({menu_id : menuObj.id})
    return DBHelper.deleteData("menu",menuObj)
}