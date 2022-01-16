const mysql = require("mysql");

const db = mysql.createPool({
    host: "eu-cdbr-west-01.cleardb.com",
    user: "b3fdf8bb6c6230",
    password: "81b66be1",
    database: "heroku_41bc44bfe273b2f",
    port: "3306"
})

module.exports = db;