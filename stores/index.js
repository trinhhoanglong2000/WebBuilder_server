const express = require('express');
const router = express.Router();
const fse = require('fs-extra')
const http = require('../const')

router.get('/', function (req, res, next) {
    {
        let hostURL = req.get('Host')
        console.log("cHECK ME")
        console.log(hostURL)
        console.log(req)
        //console.log(req)
        let directory = req.originalUrl
        if (hostURL.includes(":5000")) {
            hostURL = hostURL.slice(0, hostURL.length - 5)

        }
        // local host and server
        console.log(hostURL)
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
            console.log(wordPath)
            if (wordPath[0] === "/") {
                wordPath[0] = "/home"
            }
            res.sendFile("index.html", {
                root: __dirname + `/${hostURL}${wordPath[0]}`
            })
        }
    }

});

module.exports = router;