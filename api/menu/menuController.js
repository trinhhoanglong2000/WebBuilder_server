const menuService = require('./menuService');
const menuItemService = require('../menuItem/menuItemService')
const http = require('../../const');

exports.createMenu = async (req, res) => {
    // create new store
    const menuObj = {
        store_id: req.body.store_id,
        name: req.body.name
    };
    const newMenu = await menuService.createMenu(menuObj);
    if (newMenu) {
        res.status(http.Created).json({
            statusCode: http.Created,
            data: newMenu,
            message: "Create menu successfully!"
        })
    }
    else {
        res.status(http.ServerError).json({
            statusCode: http.ServerError,
            message: "Server error!"
        })
    }
}

exports.getMenuItem = async (req, res) => {
    const query = req.query;
    query.menu_id = req.params.menu_id;
    let menu = await menuService.getMenuById({ id: req.params.id });
    if (menu) {
        menu = menu[0];
        let item = await menuItemService.getMenuItemByMenuId({ menu_id: menu.id })
        menu.listMenuItem = item;
        res.status(http.Success).json({
            statusCode: http.Success,
            data: menu,
            message: "Get menu successfully!"
        })
    }
    else {
        res.status(http.ServerError).json({
            statusCode: http.ServerError,
            message: "Server error!"
        })
    }
}

exports.updateMenu = async (req, res) => {
    const menuObj = {
        id: req.body.id,
        title: req.body.title
    };
    const result = await menuService.updateMenu(menuObj);
    if (result) {
        res.status(http.Success).json({
            statusCode: http.Success,
            data: result,
            message: "update menu item successfully!"
        })
    }
    else {
        res.status(http.ServerError).json({
            statusCode: http.ServerError,
            message: "Server error!"
        })
    }
}