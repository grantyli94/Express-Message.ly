"use strict";

const Router = require("express").Router;
const router = new Router();
const User = require('../models/user');

/** POST /login: {username, password} => {token} */


/** POST /register: registers, logs in, and returns token.
 *
 * {username, password, first_name, last_name, phone} => {token}.
 */

router.post('/register', async function (req, res, next) {
  let body = req.body;
  // console.log("#############",body);
  let result = await User.register(body);
  return res.json(result);
})

module.exports = router;