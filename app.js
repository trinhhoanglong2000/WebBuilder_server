const createError = require('http-errors');
const express = require('express');
const path = require('path');
const cookieParser = require('cookie-parser');
const logger = require('morgan');
const cors=require('cors');
require('dotenv').config();
const mongoose = require('mongoose');
const db = require('./database');

const passport = require('./helper/passport');
const accountsRouter = require('./api/accounts');
const pageRouter = require('./api/page');
const productRouter = require('./api/products');
const fileRouter = require('./api/files');
const storeRouter = require('./api/stores');
const collectionRouter = require('./api/collections');
const bannerRouter = require('./api/banners');
const authRouter = require('./api/authenticator');
const authenticator = require('./middleware/authentication');
const bodyParser = require('body-parser')
const app = express();

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
  origin: [process.env.MANAGEMENT_CLIENT_URL, process.env.EDITOR_CLIENT_URL],
  optionsSuccessStatus: 200,
  credentials: true,
  methods: "GET, PUT, POST, DELETE"
}
app.use(logger('dev'));
app.use(express.json({limit:'50mb'}));
app.use(cookieParser());
app.use(cors(corsOptions));
app.use(passport.initialize());

app.use('/account', authenticator.Authenticate, accountsRouter);
app.use('/files', fileRouter);
app.use('/auth', authRouter);
app.use('/stores', authenticator.Authenticate, storeRouter);
app.use('/pages', authenticator.Authenticate, pageRouter);
app.use('/products', productRouter);
app.use('/collections', collectionRouter);
app.use('/banners', bannerRouter);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});

// error handler
app.use(function(err, req, res, next) {
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

module.exports = app;
