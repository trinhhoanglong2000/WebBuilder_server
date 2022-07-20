const DBHelper = require('../../helper/DBHelper/DBHelper')
const menuItemService = require('../menuItem/menuItemService')
const fileService = require('../files/fileService')
const AWS = require('aws-sdk');
const s3 = new AWS.S3();
const { v4: uuidv4 } = require('uuid');

exports.createMenu = async (menuObj) => {
    menuObj.id = uuidv4();

    // upload menu_item to s3
    const body = JSON.stringify([], null, '/t');
    const key = `menu/${menuObj.id}`
    const rest = await fileService.uploadTextFileToS3(body, key, 'json');

    menuObj.menu_item = rest.Location;

    return DBHelper.insertData(menuObj, "menu", false, "id")
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
    let condition = [];

    condition.push({ store_id: query.store_id })
    if (query.name)
        condition.push({ 'UPPER(name)': { "OP.ILIKE": "%" + query.name.toUpperCase().trim() + "%" } })


    let config = {
        where: {
            "OP.AND": condition
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
    //await menuItemService.deleteMenuItem({ menu_id: menuObj.id })

    const key = `menu/${menuObj.id}.json`;
    await fileService.deleteObjectByKey(key)

    return DBHelper.deleteData("menu", menuObj)
}

exports.updateSubMenu = async (menuObj) => {
    const body = JSON.stringify(menuObj.listMenuItem, null, '');
    const key = `menu/${menuObj.id}`
    const rest = await fileService.uploadTextFileToS3(body, key, 'json');

    menuObj.menu_item = rest.Location;
    return DBHelper.updateData({menu_item : rest.Location,id : menuObj.id},"menu","id")
}

var getMenuItem = exports.getMenuItem = async (menuId) => {
    try {
        const data = await s3.getObject({
            Bucket: "ezmall-bucket",
            Key: `menu/${menuId}.json`
        }).promise();
        const content = JSON.parse(data.Body.toString('utf-8'));
        if (content){
            return content;
        }
        else {
            return []
        }
      
    } catch (error) {
        console.log(error);
        return null;
    }
};

exports.getHeaderMenu = async (storeId) => {
    query = {
        name : "Header Menu",
        store_id : storeId
    }
    const menu = await DBHelper.getData("menu",query)
    if (menu){
        if (menu.length == 0 ){
            return null
        }
        else{
            return getMenuItem(menu[0].id)
        }
    }
    else {
        return null
    }
}