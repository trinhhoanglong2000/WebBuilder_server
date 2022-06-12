const http = require('../../const');
const DBHelper = require('../../helper/DBHelper/DBHelper')
const storeService = require('../stores/storeService')
const { v4: uuidv4 } = require('uuid');
const { query } = require('express');
const { config } = require('dotenv');
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
        offset : query.offset,
        limit : query.limit
    }
    return DBHelper.FindAll("template", config)
}

var getAllFreeStoreTemplate = exports.getAllFreeStoreTemplate = async (query) => {
    const storeData = await storeService.findById(query.store_id)
    if (storeData) {
        const current = new Date();
        if (current > storeData.enroll_time) {
            const config = {
                where: {
                    "OP.AND": [
                        { "level": 1 },
                        { "is_paid" : false }
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
                        { "is_paid" : false }
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