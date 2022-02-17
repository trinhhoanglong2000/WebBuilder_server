const createError = require('http-errors');
const express = require('express');
const path = require('path');
const cookieParser = require('cookie-parser');
const logger = require('morgan');
const cors=require('cors');
require('dotenv').config();
const mongoose = require('mongoose');

const passport = require('./modules/passport');
const accountsRouter = require('./api/accounts');
const pageRouter = require('./api/page');
const productRouter = require('./api/products');
const loginRouter = require('./modules/passport/loginRouter');
const authRouter = require('./api/authenticator');
const app = express();

mongoose.connect(process.env.DATABASE_URL, 
  {
    useNewUrlParser: true,
    useUnifiedTopology: true
  }
)
.then(() => {
  console.log("DB connected!")
})
.catch((err) => {
 console.log("DB not connected " + err);
})

const corsOptions = {
  origin: process.env.CLIENT_URL,
  optionsSuccessStatus: 200,
  credentials: true,
  methods: "GET, PUT, POST, DELETE"
}

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(cors(corsOptions));
app.use(passport.initialize());

app.use('/accounts',  accountsRouter);
app.use('/login', loginRouter);
app.use('/auth', authRouter);
app.use('/pages', pageRouter);
app.use('/products', productRouter);

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
