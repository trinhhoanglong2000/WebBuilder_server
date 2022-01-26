const express = require('express');
const jwt = require('jsonwebtoken');
const router = express.Router();
const passport = require('./index');

/* GET home page. */
router.post('/', passport.authenticate('local', {session: false}), function(req, res, next) {
  if (req.user.message) {
    return res.json({
      statusCode: 401,
      message: req.user.message
    });
  }
  else res.json({
    statusCode: 200,
    data: {
      user: req.user,
      token: jwt.sign({
          _id: req.user._id,
          email: req.user.email,
      }, process.env.JWT_SECRET, {
          expiresIn: '1h'
      })
    },
    message: "Login sucessfully!"
  }); 
});

module.exports = router;
