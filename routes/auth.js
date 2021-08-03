"use strict";

const Router = require("express").Router;
const router = new Router();

const jwt = require('jsonwebtoken');
const { SECRET_KEY } = require('../config');
// const JWT_OPTIONS = { expiresIn: 60 * 60 };

const User = require('../models/user');
const { UnauthorizedError } = require('../expressError');

/** POST /login: {username, password} => {token} */

router.post('/login', async function (req, res, next) {
  let { username, password } = req.body; 
  if (await User.authenticate(username, password) === true) {
    let token = jwt.sign({ username }, SECRET_KEY);
    User.updateLoginTimestamp(username);
    return res.json({ token });
  }
  throw new UnauthorizedError("Invalid user/password");
})

/** POST /register: registers, logs in, and returns token.
 *
 * {username, password, first_name, last_name, phone} => {token}.
 */

router.post('/register', async function (req, res, next) {
  let body = req.body;
  let result = await User.register(body);
  let token;
  if (result) {
    let payload = { username: result.username };
    token = jwt.sign(payload, SECRET_KEY);
    User.updateLoginTimestamp(result.username);
  }
  return res.json({ token }); // handle error if registration failed?
})

module.exports = router;