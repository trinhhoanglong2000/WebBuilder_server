const passport = require('passport')
const db = require("../../database/index");
const { v4: uuidv4 } = require('uuid');

exports.updateData = async (data, name, condition) => {
    console.log(uuidv4())
    let arr = Object.keys(data)
    let conditionArr
    for (var i = 0; i < arr.length; i++) {

        if (arr[i] === condition) {
            conditionArr = arr.splice(i, 1);
        }
    }
    try {

        // const result = await db.query(`
        // with source as (SELECT * FROM jsonb_populate_record(NULL::account, 
        //     '${JSON.stringify(data)}'::jsonb))
        // update account
        // set (fullname,phone) = (j.fullname,j.phone)
        // from source AS j
        // where account.id = j.id;
        //     `);
        const result = await db.query(`
        with jsondata(jdata) as (
            values (jsonb_strip_nulls('${JSON.stringify(data)}')::jsonb)
        )
        update ${name}
        set (${arr}) = (select ${arr}
            from jsonb_populate_record(NULL::${name}, to_jsonb(${name}) || jdata))
        from jsondata
            where ${name}.${conditionArr[0]} = (jdata->>'${conditionArr[0]}')::text;
            `);
        return result;
    } catch (error) {
        console.log(error);
        return null;
    }
}
exports.insertData = async (data, name, needId) => {
    try {
        // create
        if (needId) {
            data.id = uuidv4()
        }

        let arr = Object.keys(data)
        let arr1 = Object.values(data)
        for (var i = 0; i < arr1.length; i++) {
            if (Array.isArray(arr1[i])) {

                for (let j = 0; j < arr1[i].length; j++) {
                    arr1[i][j] = "\"" + arr1[i][j] + "\""
                }

                arr1[i] = "'{" + arr1[i] + "}'"
            }
            else {
                arr1[i] = "'" + arr1[i] + "'"
            }
        }
        // console.log(data)
        let result
        if (needId){
            result = await db.query(`
            INSERT INTO ${name} (${arr})
            VALUES (${arr1})
            RETURNING id
            `,);
        }else {
            result = await db.query(`
            INSERT INTO ${name} (${arr})
            VALUES (${arr1})
            `,);
        }
      
        return result;
    } catch (error) {
        console.log(error);
        return null;
    }
}
exports.getData = async (name, data = null) => {
    try {
        if (data === null) {
            const result = await db.query(`
        SELECT *
        FROM ${name}
        `,);
            return result.rows;
        }
        else {
            let arr = Object.keys(data)
            let arr1 = Object.values(data)
            for (var i = 0; i < arr1.length; i++) {
                arr1[i] = "'" + arr1[i] + "'"
            }

            const result = await db.query(`
        SELECT *
        FROM ${name}
        WHERE (${arr}) = (${arr1})
        `,);
            return result.rows;
        }
    } catch (error) {
        console.log(error);
        return null;
    }
}
function LoopForOP(data) {
    if (isObject(data) === false) {
        return data
    }
    let OP = [
        "OP.OR",
        "OP.AND",
        "OP.LIKE",
        "OP.ILIKE",
        "OP.NLIKE",
        "OP.NILIKE",
        "OP.GTE",
        "OP.GT",
        "OP.LT",
        "OP.LTE"
    ]

    // a = {
    // where:{ "OP.AND": [
    //     {"OP.OR" : [{a : {"OP.GT" : 123}}, {b : "456"}]},
    //     {c : {"OP.LIKE" : }}
    // ]}

    let arr = Object.keys(data)
    let arr1 = Object.values(data)
    let query = ""
    if (arr[0] == "OP.OR") {
        query += "("
        query = query + LoopForOP(arr1[0][0])
        for (let i = 1; i < arr1[0].length; i++) {
            query = query + " OR " + LoopForOP(arr1[0][i])
        }
        query += ")"
    }
    else if (arr[0] == "OP.AND") {
        query += "("
        query = query + LoopForOP(arr1[0][0])
        for (let i = 1; i < arr1[0].length; i++) {
            query = query + " AND " + LoopForOP(arr1[0][i])
        }
        query += ")"
    }
    else if (arr[0] == "OP.LIKE") {
        query += ` LIKE '${arr1[0]}'`
    }
    else if (arr[0] == "OP.ILIKE") {
        query += ` ILIKE '${arr1[0]}'`
    }
    else if (arr[0] == "OP.NILIKE") {
        query += ` NOT ILIKE '${arr1[0]}'`
    }
    else if (arr[0] == "OP.NLIKE") {
        query += ` NOT LIKE '${arr1[0]}'`
    }
    else if (arr[0] == "OP.GT") {
        query += ` > '${arr1[0]}'`
    }
    else if (arr[0] == "OP.GTE") {
        query += ` >= '${arr1[0]}'`
    }
    else if (arr[0] == "OP.LT") {
        query += ` < '${arr1[0]}'`
    }
    else if (arr[0] == "OP.LTE") {
        query += ` <= '${arr1[0]}'`
    }
    else {

        if (isObject(arr1[0])) {
            query = query + arr[0] + LoopForOP(arr1[0])
        }
        else {
            query += `${arr[0]} = '${arr1[0]}'`
        }
    }
    return query
}
exports.FindAll = async (name, data = null) => {
    
    try {
        let where = ""
        let select = "*"
        let limit = ""
        let ofset = ""
        let from  = `FROM ${name}`
        if (data.join){
            let subFrom = `FROM ${name} `
            let arr = Object.keys(data.join)
            let arr1 = Object.values(data.join)
            for (let i = 0 ; i < arr.length; i++){
                let arr2 = Object.keys(arr1[i].condition)
                subFrom += `${arr1[i].type?arr1[i].type.toUpperCase():""}JOIN ${arr[i]}
                ON  ${arr2[0]} = ${arr1[i].condition[arr2[0]]} 
                `
            }
            from = subFrom
            // from = `FROM ${name} as a JOIN ${data.join.name} as b
            // ON ${arr[0]} = ${arr1[0]}`
        }
        if (data.where) {
            where = `WHERE ${LoopForOP(data.where)}`;
        }
        if (data.select) {
            select = data.select
        }
        if (data.limit) {
            limit = `LIMIT ${data.limit}`
        }
        if (data.offset) {
            ofset = `OFFSET ${data.offset}`
        }
        // id = "123"
        // price > 123
        // newdata = {
        // select:"",   
        //     where: {
        //         "OP.AND" : [{price : {"OP.GT" : 123}}, "OP:OR : [{b:"123"},{ c:"1234"}]]
        //     },
        //     off:
        //      limit

        // }
        let query = `
        SELECT ${select}
        ${from}
        ${where}
        ${limit}
        ${ofset}
        `
        console.log(query)
        const result = await db.query(query);
        return result.rows;

    } catch (error) {
        console.log(error);
        return null;
    }
}

function isObject(val) {
    return val instanceof Object;
}