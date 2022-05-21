const DBHelper = require('../../helper/DBHelper/DBHelper')

exports.createMenuItem = async (menuItemObj) => {
    return DBHelper.insertData(menuItemObj, "menu_item", true)
}

exports.getMenuItemByMenuId = async (query) => {
    let config = {
        where: {
            menu_id: query.menu_id
        },
        limit: query.limit,
        offset: query.offset
    }
    return DBHelper.FindAll("menu_item", config)
}

exports.updateMenuItem = async (menuItemObj) => {
    return DBHelper.updateData(menuItemObj, 'menu_item', 'id')
}

exports.deleteMenuItem = async (query) => {
    return DBHelper.deleteData('menu_item', query);
}