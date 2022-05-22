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
const variantsRouter = require('./api/variants');
const menuRouter = require('./api/menu');
const menuItemRouter = require('./api/menuItem');
const productOptionRouter = require('./api/products_option')
const authenticator = require('./middleware/authentication');
const userStoreRouter = require('./stores')
const app = express();

const subdomain = require('express-subdomain')

const corsOptions = {
  origin: true,
  optionsSuccessStatus: 200,
  credentials: true,
  methods: "GET, PUT, POST, DELETE"
}
app.use(logger('dev'));
app.use(express.json({ limit: '50mb' }));
app.use(cookieParser());
app.use(cors(corsOptions));
app.use(passport.initialize());
app.use(express.static('dist'))

app.use('*',userStoreRouter)

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
app.get('/',function (req,res) {
  res.send("Hi")
})
app.use('/menu', menuRouter);
app.use('/menu-item', menuItemRouter);
// catch 404 and forward to error handler
app.use(function (req, res, next) {
  next(createError(404));
});

// error handler
app.use(function (err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.json({
    message: err.message,
    error: err
  });
});
// if (!fse.existsSync(`stores/mystore/test.js`)) {
//   fse.outputFile('stores/mystore/test.js', 'It you')
//     .then(() => {
//       console.log('The file has been saved!');
//     })
//     .catch(err => {
//       console.error(err)
//     });
// }

module.exports = app;
