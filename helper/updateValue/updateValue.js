const passport = require('passport')
const db = require("../../database/index");
exports.readData = async (data,name,condition) => {
    // console.log(JSON.stringify(data))
    // console.log(name)
   let arr = Object.keys(data)
   let conditionArr 
    for( var i = 0; i < arr.length; i++){ 
    
        if ( arr[i] === condition) { 
    
            conditionArr = arr.splice(i, 1); 
        }
    
    }
    console.log(conditionArr)
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