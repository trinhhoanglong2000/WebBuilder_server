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

exports.getHeaderMenuItemsByStoreId = async (query) => {
    let config = {
        select: "menu_item.id, menu_item.name, menu_item.link",
        where: {
            "OP.AND": [{"menu.store_id": query.store_id}, {"menu.name": "Header Menu"}]
        },
        join: {
            "menu": {
                condition: {
                    "menu_item.menu_id": "menu.id",
                }   
            }
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