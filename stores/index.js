const express = require('express');
const router = express.Router();
const fse = require('fs-extra')
const http = require('../const')
router.get('/', function (req, res, next) {
    {
        let a = req.subdomains
        console.log(req.subdomains)
        if (a.length == 1) {
            if (!fse.existsSync(`stores/${a[0]}`)) {
                res.status(http.NotFound).json({
                    statusCode: http.ServerError,
                    message: "Not Found!"
                })
                return
            }

            res.sendFile("index.html", {
                root: __dirname + `/${a[0]}/home`
            });

            // const newRouter = require(`./stores/${a[0]}`)
            // app.use(subdomain(`${a[0]}`, newRouter))

            // if (fse.existsSync(`stores/${a[0]}`)){
            //   next()
            // }
        }
        else {
            next()
        }
    }

});
module.exports = router;