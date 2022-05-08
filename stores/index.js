const express = require('express');
const router = express.Router();
const fse = require('fs-extra')
const http = require('../const')
const dns = require('dns')
router.get('/', function (req, res, next) {
    {
        let hostURL = req.get('Host')
        console.log(req.subdomains)
        var domains = dns.resolveCname(req.hostname,(err,address)=>{
            console.log(address)
        })
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