const createError = require('http-errors');
const express = require('express');
const path = require('path');
const cookieParser = require('cookie-parser');
const logger = require('morgan');
const cors = require('cors');
require('dotenv').config();
const http = require('./const')
const fse = require('fs-extra')

const passport = require('./helper/passport');
const accountsRouter = require('./api/accounts');
const pageRouter = require('./api/page');
const productRouter = require('./api/products');
const fileRouter = require('./api/files');
const storeRouter = require('./api/stores');
const collectionRouter = require('./api/collections');
const bannerRouter = require('./api/banners');
const authRouter = require('./api/authenticator');
const variantsRouter = require('./api/variants')
const productOptionRouter = require('./api/products_option')
const authenticator = require('./middleware/authentication');
const app = express();
const subdomain = require('express-subdomain')
// mongoose.connect(process.env.DATABASE_URL, 
//   {
//     useNewUrlParser: true,
//     useUnifiedTopology: true
//   }
// )
// .then(() => {
//   console.log("DB connected!")
// })
// .catch((err) => {
//  console.log("DB not connected " + err);
// })

// db.connect(() => {
//   console.log("Connected to Database!");
// })

const corsOptions = {
  origin: false,
  optionsSuccessStatus: 200,
  credentials: true,
  methods: "GET, PUT, POST, DELETE"
}
app.use(logger('dev'));
app.use(express.json({ limit: '50mb' }));
app.use(cookieParser());
app.use(cors(corsOptions));
app.use(passport.initialize());

app.use('*', function (req, res, next) {

  let a = req.subdomains
  console.log(req.subdomains)
  if (a.length == 1) {
    const newRouter = require(`./stores/${a[0]}`)
    //const newRouter = require(`./${a[0]}`)
    app.use(subdomain(`${a[0]}`, newRouter))
  }
  if (a.length == 0) {
    next()
  }
  else {
    res.status(http.NotFound).json({
      statusCode: http.NotFound,
      message: "Not Found"
    })
  }


})
app.use('/account', accountsRouter);
app.use('/files', fileRouter);
app.use('/auth', authRouter);
app.use('/stores', storeRouter);
app.use('/pages', authenticator.Authenticate, pageRouter);
app.use('/products', productRouter);
app.use('/collections', collectionRouter);
app.use('/banners', bannerRouter);
app.use('/variants', variantsRouter);
app.use('/productoption', productOptionRouter)

function getSubdomain(hostname) {
  var regexParse = new RegExp('[a-z\-0-9]{2,63}\.[a-z\.]{2,5}$');
  var urlParts = regexParse.exec(hostname);
  return hostname.replace(urlParts[0], '').slice(0, -1);
}
//console.log(getSubdomain(window.location.hostname));)

// app.use(subdomain('*',userStoreRouter))
// catch 404 and forward to error handler


// error handler
app.use(function (err, req, res, next) {
  // set locals, only providing error in development
  console.log(req.hostname)
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.json({
    message: err.message,
    error: err
  });
});
if (!fse.existsSync(`stores/mystore/test.js`)) {
  fse.outputFile('stores/mystore/test.js', 'It you')
    .then(() => {
      console.log('The file has been saved!');
    })
    .catch(err => {
      console.error(err)
    });
}
module.exports = app;
