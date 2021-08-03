"use strict";

const Router = require("express").Router;
const express = require("express");
const router = new Router();
const { ensureLoggedIn, ensureCorrectUser } = require("../middleware/auth");
const User = require("../models/user");
const Message = require("../models/message");
const { SECRET_KEY } = require('../config');
const jwt = require('jsonwebtoken');


/** GET / - get list of users.
 *
 * => {users: [{username, first_name, last_name, phone}, ...]}
 *
 **/
router.get("/", ensureLoggedIn, async function (req, res, next) {
  let results = await User.all();
  console.log("ALLLLL");
  return res.json({users: results});
});

/** GET /:username - get detail of users.
 *
 * => {user: {username, first_name, last_name, phone, join_at, last_login_at}}
 *
 **/
router.get("/:username", ensureCorrectUser, async function (req, res, next) {
  let result = await User.get(req.params.username);
  return res.json({user: result});
});


/** GET /:username/to - get messages to user
 *
 * => {messages: [{id,
 *                 body,
 *                 sent_at,
 *                 read_at,
 *                 from_user: {username, first_name, last_name, phone}}, ...]}
 *
 **/
router.get("/:username/to", ensureCorrectUser, async function (req, res, next) {
  let results = await User.messagesTo(req.params.username);
  return res.json({messages: results});
});


/** GET /:username/from - get messages from user
 *
 * => {messages: [{id,
 *                 body,
 *                 sent_at,
 *                 read_at,
 *                 to_user: {username, first_name, last_name, phone}}, ...]}
 *
 **/
router.get("/:username/from", ensureCorrectUser, async function (req, res, next) {
  let results = await User.messagesFrom(req.params.username);
  return res.json({messages: results});
});

module.exports = router;