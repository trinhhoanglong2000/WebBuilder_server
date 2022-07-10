const DBHelper = require('../../helper/DBHelper/DBHelper')

exports.createMenuItem = async (menuItemObj) => {
    return DBHelper.insertData(menuItemObj, "menu_item", true)
}


var loopGetMenu = exports.loopGetMenu = async (query) => {
    let config = {
        select : "id, menu_id, expanded, children, name as title, link as subtitle",
        where: {
            id: query.id
        },
        limit: query.limit,
        offset: query.offset
    }
    let data = await DBHelper.FindAll("menu_item", config)
    data = data[0] 
    if (data){
        const returnData = {
            id : data.id,
            menu_id : data.menu_id,
            title : data.title,
            subtitle : data.subtitle,
            expanded : data.expanded
        }
        const children = []
        if (data.expanded) {
            for (let j = 0; j < data.children.length ; j++){
                children.push(await loopGetMenu({id : data.children[j]}))
            }
            returnData.children = children
        }
        
        return returnData
    }
    else {
        return null
    }
}

exports.getMenuItemByMenuId = async (query) => {
    let config = {
        select : "id, menu_id, expanded, children, name as title, link as subtitle",
        where: {
            "OP.AND" : [{menu_id: query.menu_id},
            {first_level : true }]
        },
        limit: query.limit,
        offset: query.offset
    }
    const data = await DBHelper.FindAll("menu_item", config)
    if (data){
        let returnArr = []
    
        for (let i = 0 ; i < data.length; i++){
            const returnData = {
                id : data[i].id,
                menu_id : data[i].menu_id,
                title : data[i].title,
                subtitle : data[i].subtitle,
                expanded : data[i].expanded
            }
            const children = []
            if (data[i].expanded) {
                for (let j = 0; j < data[i].children.length ; j++){
                    children.push( await loopGetMenu({id : data[i].children[j]}))
                }
                returnData.children = children
            }
            returnArr.push(returnData)
        }   
        return returnArr
    }
    else {
        return null
    }
}

exports.getHeaderMenuItemsByStoreId = async (query) => {
    let config = {
        select: "menu_item.id, menu_item.menu_id, menu_item.expanded, menu_item.children, menu_item.name as title, menu_item.link as subtitle",
        where: {
            "OP.AND": [{"menu.store_id": query.store_id}, {"menu.name": "Header Menu"}, {"menu_item.first_level" : true}], 
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
    const data = await DBHelper.FindAll("menu_item", config)
  
    if (data){
        let returnArr = []
    
        for (let i = 0 ; i < data.length; i++){
            const returnData = {
                id : data[i].id,
                menu_id : data[i].menu_id,
                title : data[i].title,
                subtitle : data[i].subtitle,
                expanded : data[i].expanded
            }
            const children = []
            if (data[i].expanded) {
                for (let j = 0; j < data[i].children.length ; j++){
                    children.push( await loopGetMenu({id : data[i].children[j]}))
                }
                returnData.children = children
            }
            returnArr.push(returnData)
        }   
        return returnArr
    }
    else {
        return null
    }
}

var updateMenuItem =exports.updateMenuItem = async (menuItemObj) => {
    return DBHelper.updateData(menuItemObj, 'menu_item', 'id')
}

var loopUpdateSubMenu = exports.loopUpdateSubMenu = async (menuItemObj) => {
    const returnData = []
    for (let i = 0 ; i < menuItemObj.length; i++){
        returnData.push(menuItemObj[i].id)
        let queryData = {
            id : menuItemObj[i].id,
            menu_id : menuItemObj[i].menu_id,
            first_level : false,
            name : menuItemObj[i].title,
            link : menuItemObj[i].subtitle,
            expanded : menuItemObj[i].expanded
        }

        if (menuItemObj[i].expanded){
            queryData.children = await loopUpdateSubMenu(menuItemObj[i].children)
        }
        else {
            queryData.children = null
        }
        await updateMenuItem(queryData)
    }
    return returnData
}

exports.updateSubMenuItem = async (menuItemObj) => {
    for (let i = 0 ; i < menuItemObj.length; i++){
        let queryData = {
            id : menuItemObj[i].id,
            menu_id : menuItemObj[i].menu_id,
            first_level : true,
            name : menuItemObj[i].title,
            link : menuItemObj[i].subtitle,
            expanded : menuItemObj[i].expanded
        }
       
        if (menuItemObj[i].expanded){
            queryData.children = await loopUpdateSubMenu(menuItemObj[i].children)
        }
        else {
            queryData.children = null
        }
        const update = await updateMenuItem(queryData)
        if (!update){
            return null
        }
    }
    return true
}

var getMenuItem = exports.getMenuItem = async (query) => {
    const data = await DBHelper.getData("menu_item", query)
    if (data){
        return data[0]
    }
    else {
        return null
    }
}

var deleteMenuItem =exports.deleteMenuItem = async (query) => {
    const data = await getMenuItem(query)
    if (data.expanded){
        for (let i = 0; i <  data.children.length; i++){
            await deleteMenuItem({id : data.children[i]})
        } 
    }
    return DBHelper.deleteData('menu_item', query);
}