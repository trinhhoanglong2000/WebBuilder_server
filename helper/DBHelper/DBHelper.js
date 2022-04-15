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
            arr1[i] = "'" + arr1[i] + "'"
        }
        const result = await db.query(`
        INSERT INTO ${name} (${arr})
        VALUES (${arr1})
        RETURNING id
        `,);
        return result;
    } catch (error) {
        console.log(error);
        return null;
    }
}
exports.getData = async (data, name) => {
    try {
        let arr = Object.keys(data)
        let arr1 = Object.values(data)

        if (data === null || arr.length === 0) {
            const result = await db.query(`
        SELECT *
        FROM ${name}
        `,);
            return result.rows;
        }
        else {
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