const http = require('../../const');
const DBHelper = require('../../helper/DBHelper/DBHelper')
const storeService = require('../stores/storeService')
const { v4: uuidv4 } = require('uuid');
const { query } = require('express');
const { config } = require('dotenv');
const pageService = require('../page/pageService')
const URLParser = require('../../helper/common/index')
const menuService = require('../menu/menuService')
const menuItemService = require('../menuItem/menuItemService')
exports.getTemplate = async (query) => {

    let config = {
        select: "id",
        where: {
            "name": query.name,
        },
    }
    return DBHelper.FindAll("template", config)
}

const getTemplateById = exports.getTemplateById = async (query) => {
    return DBHelper.getData("template", query)
}
exports.insertTemplateUser = async (query) => {
    return DBHelper.insertData(query, "account_template", false, null)
}

exports.getFreeStoreTemplate = async (query) => {
    const userTemplate = await getTemplateAccount({ user_id: query.user_id })
    const paidStores = await getAllFreeStoreTemplate(query)

    for (let i = 0; i < paidStores.length; i++) {
        if (userTemplate.find(ele => ele.template_id === paidStores[i].id)) {
            paidStores[i].owned = true
        }
        else {
            paidStores[i].owned = false
        }
    }
    return paidStores
}

exports.getPaidStoreTemplate = async (query) => {
    const userTemplate = await getTemplateAccount({ user_id: query.user_id })
    const paidStores = await getAllPaidStoreTemplate(query)

    for (let i = 0; i < paidStores.length; i++) {
        if (userTemplate.find(ele => ele.template_id === paidStores[i].id)) {
            paidStores[i].owned = true
        }
        else {
            paidStores[i].owned = false
        }
    }
    return paidStores
    // if (storeData) {
    //     const current = new Date();
    //     if (current > storeData.enroll_time) {
    //         return []
    //     }
    //     else {
    //         const config = {
    //             where: { "OP.AND" : [
    //                 { "level" : { "OP.LTE" : storeData.level} },
    //                 { "OP.NOT" : { "level" : 1}}
    //             ]},
    //             offset: query.offset,
    //             limit: query.limit
    //         }
    //         return DBHelper.FindAll("template", config)
    //     }
    // }
    // else {
    //     return []
    // } 
}

exports.getStoreTemplate = async (query) => {
    const storeData = await storeService.findById(query.store_id)
    if (storeData) {
        const data = await getTemplateById({ id: storeData.template_id })
        if (data.length > 0) {
            return data[0]
        }
    }
    else {
        return null
    }
}

var getAllPaidStoreTemplate = exports.getAllPaidStoreTemplate = async (query) => {
    let config = {
        where: {
            "is_paid": true,
        },
        offset: query.offset,
        limit: query.limit
    }
    return DBHelper.FindAll("template", config)
}

var getAllFreeStoreTemplate = exports.getAllFreeStoreTemplate = async (query) => {
    const storeData = await storeService.findById(query.store_id)
    if (storeData) {
        const current = new Date();
        if (current > storeData.enroll_time) {
            // const config = {
            //     where: {
            //         "OP.AND": [
            //             { "level": 1 },
            //             { "is_paid": false }
            //         ]
            //     },
            //     offset: query.offset,
            //     limit: query.limit
            // }
            const config = {
                where: {
                    "OP.AND": [
                        { "level": { "OP.LTE": storeData.level } },
                        { "is_paid": false }
                    ]
                },
                offset: query.offset,
                limit: query.limit
            }
            return DBHelper.FindAll("template", config)
        }
        else {
            const config = {
                where: {
                    "OP.AND": [
                        { "level": { "OP.LTE": storeData.level } },
                        { "is_paid": false }
                    ]
                },
                offset: query.offset,
                limit: query.limit
            }
            return DBHelper.FindAll("template", config)
        }
    }
    else {
        return []
    }
}

var getTemplateAccount = exports.getTemplateAccount = async (query) => {
    let config = {
        where: {
            "user_id": query.user_id,
        },
    }
    return DBHelper.FindAll("account_template", config)
}

var getTemplateAccountWithData = exports.getTemplateAccountWithData = async (query) => {
    let config = {
        join: {
            "template": {
                condition: {
                    "account_template.template_id": "template.id",
                }
            }
        },
        select: "template.id, template.name, template.thumbnail",
        where: {
            "account_template.user_id": query.user_id
        },

    }
    return DBHelper.FindAll("account_template", config);
}

exports.getAllTemplatesAccount = async (query) => {
    const userTemplate = await getTemplateAccountWithData(query)
    const storeData = await storeService.findById(query.store_id)

    const index = userTemplate.findIndex(ele => ele.id === storeData.template_id)
    if (index != -1) {
        userTemplate[index].current = true
        return userTemplate
    }
    else {
        return []
    }
}

exports.createTemplate = async (query) => {
    const newTemplate = await DBHelper.insertData(query.template, "template", true)
    if (newTemplate) {
        const templateId = newTemplate.rows[0].id
        if (query.name) {
            for (let i = 0; i < query.name.length; i++) {
                const newQuery = {
                    template_id: templateId,
                    name: query.name[i].name,
                    is_default: query.name[i].is_default,
                }
                if (query.name[i].page_url) {
                    newQuery.page_url = query.name[i].page_url
                }
                else {
                    if (query.name[i].page_url !== "")
                        newQuery.page_url = query.name[i].page_url
                    else {
                        newQuery.page_url = '/' + URLParser.generateURL(query.name[i].name);
                    }
                }
                await DBHelper.insertData(newQuery, "template_init", true)
            }
        }
    }

    return newTemplate
}
exports.useTemplate = async (query) => {
    //GET TEMPLATE INFO
    const template = await getTemplateById({ id: query.template_id })
    let templateName
    if (template) {
        if (template.length > 0) {
            templateName = template[0].name
        }
        else {
            return null
        }
    }
    else {
        return null
    }

    //DELETE ALL PAGES
    const DefaultData = await Promise.all([pageService.getPagesByStoreId({ store_id: query.store_id }), menuService.getMenuByStoreId({ store_id: query.store_id })])
    const allPages = DefaultData[0]
    // for (let i = 0; i < allPages.length; i++) {
    //     await pageService.deletePage({ id: allPages[i].id })
    // }
    const DeletePage = Promise.all(allPages.map((ele, i) => {
        return pageService.deletePage({ id: ele.id })
    }))


    //DELETE ALL MENU
    const allMenu = DefaultData[1]
    // for (let i = 0; i < allMenu.length; i++) {
    //     await menuService.deleteMenu({ id: allMenu[i].id })
    // }
    const DeleteMenu = Promise.all(allMenu.map((ele, i) => {
        return menuService.deleteMenu({ id: ele.id })
    }))
    await Promise.all([DeletePage, DeleteMenu])
    //INSERT NEW PAGES 
    const allNewPages = await getAllTemplateInit({ template_id: query.template_id })
    let PromiseArr = []
    for (let i = 0; i < allNewPages.length; i++) {
        let createPagesQuery = {
            store_id: query.store_id,
            name: allNewPages[i].name

        }
        // await pageService.createPage(createPagesQuery, allNewPages[i].page_url, allNewPages[i].is_default, templateName, URLParser.generateURL(allNewPages[i].name));
        PromiseArr.push(pageService.createPage(createPagesQuery, allNewPages[i].page_url, allNewPages[i].is_default, templateName, URLParser.generateURL(allNewPages[i].name)))
        //await pageService.createPage(createPagesQuery, allNewPages[i].page_url, allNewPages[i].is_default, "template-default");
    }
    await Promise.all(PromiseArr)

    //CREATE DEFAULT MENU 
    let newMenuPromiseArr = []
    for (let i = 0; i < 2; i++) {
        const menuQuery = {
            store_id: query.store_id,
            is_default: true
        }
        menuQuery.name = i == 0 ? "Header Menu" : "Footer Menu"
        newMenuPromiseArr.push(menuService.createMenu(menuQuery))
    }
    const newMenuPromiseArr_result = await Promise.all(newMenuPromiseArr)
    const CreateMenuPromiseArr = []
    for (let i = 0; i < 2; i++) {
        // const menuQuery = {
        //     store_id: query.store_id,
        //     is_default: true
        // }
        // menuQuery.name = i == 0 ? "Header Menu" : "Footer Menu"
        // const newMenu = await menuService.createMenu(menuQuery)
        if (i == 0) {
            let menuItemQuery = {
                // id: newMenu.rows[0].id,
                id: newMenuPromiseArr_result[i].rows[0].id,
                listMenuItem: [
                    {
                        "title": "Home",
                        "link": "/home",
                        "expanded": false,
                    },
                    {
                        "title": "Products",
                        "link": "/collections",
                        "expanded": false,
                    },
                    {
                        "title": "Cart",
                        "link": "/cart",
                        "expanded": false,
                    }
                ]
            }
            // await menuService.updateSubMenu(menuItemQuery);
            CreateMenuPromiseArr.push(menuService.updateSubMenu(menuItemQuery))
        }
        else if (i == 1) {
            let menuItemQuery = {
                id: newMenuPromiseArr_result[i].rows[0].id,
                listMenuItem: [
                    {
                        "title": "Home",
                        "link": "/home",
                        "expanded": false,
                    },
                    {
                        "title": "Products",
                        "link": "/collections",
                        "expanded": false,
                    },
                    {
                        "title": "Cart",
                        "link": "/cart",
                        "expanded": false,
                    }
                ]
            }
            // await menuService.updateSubMenu(menuItemQuery);
            CreateMenuPromiseArr.push(menuService.updateSubMenu(menuItemQuery))
        }

    }
    await Promise.all(CreateMenuPromiseArr)
    return DBHelper.updateData({ template_id: query.template_id, id: query.store_id }, "stores", "id")
}

exports.buyTemplate = async (query) => {
    const insertQuery = {
        user_id: query.user_id,
        template_id: query.template_id
    }
    return DBHelper.insertData(insertQuery, "account_template", false, "template_id")
}

exports.getTemplateByAccount = async (query) => {
    return DBHelper.getData("account_template", query)
}

var getAllTemplateInit = exports.getAllTemplateInit = async (query) => {
    return DBHelper.getData("template_init", query)
}