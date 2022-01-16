const express = require('express');
const jwt = require('jsonwebtoken');
const router = express.Router();
const passport = require('./index');

/* GET home page. */
router.post('/', passport.authenticate('local', {session: false}), function(req, res, next) {
  if (req.user.message) {
    return res.json(req.user);
  }
  else res.json({
      user: req.user,
      token: jwt.sign({
          id: req.user.id,
          username: req.user.username,
      }, 'secret', {
          expiresIn: '1h'
      })
  });
});

module.exports = router;
