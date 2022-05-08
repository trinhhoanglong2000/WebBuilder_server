const express = require('express');
const router = express.Router();
const fse = require('fs-extra')
const http = require('../const')
const dns = require('dns')
router.get('/', async function (req, res, next) {
    {
        let hostURL = req.get('Host')
        let cname 
        const results = await Promise.allSettled([
            dns.resolve4(req.hostname,()=>{}),
            dns.resolveCname(req.hostname,()=>{}),
        ]);
        // await dns.resolveCname(req.hostname,(err,address)=>{
        //     cname = address
        //     console.log("HOHO")

        //     console.log(address)

        // })
        for (const {status, value, reason} of results) {
            if (status === "fulfilled") {
                // Promise was fulfilled, use `value`...
                console.log(value)
            } else {
                console.log(reason)
            }
        }

        // var domains2 = dns.resolve4(req.hostname,(err,address)=>{
        //     console.log(address)
        // })

        let directory = req.originalUrl
        if (hostURL.includes(":5000")) {
            hostURL = hostURL.slice(0, hostURL.length - 5)

        }
        // local host and server
        if (hostURL == "www.myeasymall.site" || hostURL == "example.com" ||hostURL =="localhost"){
            next()
            return
        }
        if (!fse.existsSync(`stores/${hostURL}`)) {
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
                root: __dirname + `/${hostURL}${wordPath[0]}`
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