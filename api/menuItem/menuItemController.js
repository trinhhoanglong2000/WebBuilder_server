const menuItemService = require('./menuItemService');
const http = require('../../const');

exports.createMenuItem = async (req, res) => {
    // create new store
    const menuItemObj = {
        menu_id: req.body.menu_id,
        name: req.body.name,
        link: req.body.link
    };
    const newMenuItem = await menuItemService.createMenuItem(menuItemObj);
    if (newMenuItem) {
        res.status(http.Created).json({
            statusCode: http.Created,
            data: newMenuItem,
            message: "Create menu item successfully!"
        })
    }
    else {
        res.status(http.ServerError).json({
            statusCode: http.ServerError,
            message: "Server error!"
        })
    }
}

exports.updateMenuItem = async (req, res) => {
    const menuItemObj = {
        id: req.body.id,
        name: req.body.name,
        link: req.body.link,
        children : req.body.children,
        expanded : req.body.expanded
    };
    const newMenuItem = await menuItemService.updateMenuItem(req.body);
    if (newMenuItem) {
        res.status(http.Success).json({
            statusCode: http.Success,
            data: newMenuItem,
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

exports.updateSubMenuItem = async (req, res) => {
    const menuItemObj = {
        id: req.body.id,
        name: req.body.name,
        link: req.body.link,
        children : req.body.children,
        expanded : req.body.expanded
    };
    const newMenuItem = await menuItemService.updateMenuItem(req.body);
    if (newMenuItem) {
        res.status(http.Success).json({
            statusCode: http.Success,
            data: newMenuItem,
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

exports.deleteMenuItem = async (req, res) => {
    const query = {
        id: req.params.id,
    };
    const result = await menuItemService.deleteMenuItem(query);
    if (result) {
        res.status(http.Success).json({
            statusCode: http.Success,
            data: result,
            message: "delete menu item successfully!"
        })
    }
    else {
        res.status(http.ServerError).json({
            statusCode: http.ServerError,
            message: "Server error!"
        })
    }
}