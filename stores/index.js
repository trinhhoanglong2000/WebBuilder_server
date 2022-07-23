const express = require('express');
const router = express.Router();
const fse = require('fs-extra')
const http = require('../const')
const dns = require('dns');
const fileService = require('../api/files/fileService')
router.get('/', async (req, res, next) => {
    {
        console.log("!23")
        let hostURL = req.get('Host')
        let subdomain = req.subdomains;
        let urlArr = hostURL.split('.')
        const rootDomain = urlArr.length >= 2 ? urlArr[urlArr.length - 2] : "myeasymall";
        if (subdomain.length == 0 || subdomain.length >= 2 || (subdomain.includes("www"))) {
            if (rootDomain === 'myeasymall') {
                next()
                return
            }
        }

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
        // console.log(result[0])//ip4
        // console.log(result[1])//Cname


        if (result[1]) {
            if (rootDomain !== "myeasymall") {
                subdomain = result[1][0] ? result[1][0].match(/(.*).myeasymall/)[1].split('.') : []
            }
        }
        let directory = req.originalUrl
        // local host and server
        if (subdomain.length == 0 || subdomain.length >= 2 || (subdomain.includes("www"))) {
            next()
            return
        }
        const isExistFolder = await fileService.checkExistFile(`views/bodies/${subdomain[0]}/home/index.txt`)
        if (!isExistFolder) {
            res.status(http.NotFound).json({
                statusCode: http.NotFound,
                message: "Not Found!"
            })
            return
        }
        else {
            var reg = /.+?\:\/\/.+?(\/.+?)?(?:#|\?|)?$/;
            var pathname = reg.exec(req.headers.referer);
            //console.log(pathname)
            let wordPath = directory.split('?')

            if (wordPath[0] === "/") {
                wordPath[0] = "/home"
            }
            // res.sendFile("index.html", {
            //     root: __dirname + `/${subdomain[0]}${wordPath[0]}`
            // })
            const isExist = await fileService.checkExistFile(`views/bodies/${subdomain[0]}${wordPath[0]}/index.txt`)

            console.log("Going here")
            let pageName = isExist ? wordPath[0] : "/page-not-found"
            const pageConfig = await Promise.all([
                fileService.getFile(`views/partials/${subdomain[0]}/pages${pageName}/index.txt`),
                fileService.getFile(`views/partials/${subdomain[0]}/header.txt`),
                fileService.getFile(`views/partials/${subdomain[0]}/footer.txt`),
                fileService.getFile(`views/partials/${subdomain[0]}/config.txt`),
                fileService.getFile(`views/bodies/${subdomain[0]}${pageName}/index.txt`),
            ])
            res.render(`bodies/index`,
                {
                    pageConfig: function () { return pageConfig[0] },
                    header: function () { return pageConfig[1] },
                    footer: function () { return pageConfig[2] },
                    config: function () { return pageConfig[3] },
                    main: function () { return pageConfig[4] }
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