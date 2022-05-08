const express = require('express');
const router = express.Router();
const fse = require('fs-extra')
const http = require('../const')

router.get('/', function (req, res, next) {
    {
        let hostURL = req.get('Host')
        let directory = req.originalUrl
        if (hostURL.includes(":5000")) {
            hostURL = hostURL.slice(0, hostURL.length - 5)

        }
        // local host and server
        if (hostURL == "www.myeasymall.site" || hostURL == "example.com"){
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