const http = require('../../const');
const DBHelper = require('../../helper/DBHelper/DBHelper')
const storeService = require('../stores/storeService')
const { v4: uuidv4 } = require('uuid');
const { query } = require('express');
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

exports.getFreeTemplate = async (query) => {
    const config = {
        where: { "level": 1 },
        offset: query.offset,
        limit: query.limit
    }
    return DBHelper.FindAll("template", config)
}

exports.getPaidStoreTemplate = async (query) => {
    const storeData = await storeService.findById(query.store_id)
    if (storeData) {
        const current = new Date();
        if (current > storeData.enroll_time) {
            return []
        }
        else {
            const config = {
                where: { "OP.AND" : [
                    { "level" : { "OP.LTE" : storeData.level} },
                    { "OP.NOT" : { "level" : 1}}
                ]},
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

exports.getStoreTemplate = async (query) => {
    const storeData = await storeService.findById(query.store_id)
    if (storeData){
        const data = await getTemplateById({id : storeData.template_id})
        if (data.length > 0){
            return data[0]
        }
    }
    else {
        return null
    }
}
