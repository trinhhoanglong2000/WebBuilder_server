const express = require('express');
const router = express.Router();
const fse = require('fs-extra')
const http = require('../const')
const dns = require('dns');
router.get('/', async (req, res, next) => {
    {
        let hostURL = req.get('Host')
        let subdomain = req.subdomains;
        const ip4 = new Promise(((resolve, reject) => {
            dns.resolve4(req.hostname, (err, address) => {
                resolve(address)
            })
        }))
        const cName = new Promise(((resolve, reject) => {
            dns.resolveCname(req.hostname, (err, address) => {
                resolve(address)
            })
        }))
        const result = await Promise.all([ip4, cName]);
        console.log(result[0])//ip4
        console.log(result[1])//Cname

        let urlArr = hostURL.split('.')
        const rootDomain = urlArr.length >= 2 ? urlArr[urlArr.length - 2] : "myeasymall";

        if (result[1]) {
            if (rootDomain !== "myeasymall") {
                subdomain = result[1][0] ? result[1][0].match(/(.*).myeasymall/)[1] : result[1][0]
            }
        }
        let directory = req.originalUrl
        console.log(subdomain)
        // local host and server
        if (subdomain.length == 0 || subdomain.length >= 2 || (subdomain.includes("www"))) {
            next()
            return
        }
        if (!fse.existsSync(`stores/${subdomain[0]}`)) {
            res.status(http.NotFound).json({
                statusCode: http.ServerError,
                message: "Not Found!"
            })
            return
        }
        else {
            let wordPath = directory.split('?')
            if (wordPath[0] === "/") {
                wordPath[0] = "/home"
            }
            res.sendFile("index.html", {
                root: __dirname + `/${subdomain[0]}${wordPath[0]}`
            })
        }
    }

});
router.get('/product', function (req, res, next) {
    {
        res.send("Hi")
    }
});
module.exports = router;