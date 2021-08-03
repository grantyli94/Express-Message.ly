"use strict";

const Router = require("express").Router;
const router = new Router();
const { ensureLoggedIn } = require("../middleware/auth");
const Message = require('../models/message');
const { UnauthorizedError, BadRequestError } = require('../expressError');

router.use(ensureLoggedIn);


/** GET /:id - get detail of message.
 *
 * => {message: {id,
 *               body,
 *               sent_at,
 *               read_at,
 *               from_user: {username, first_name, last_name, phone},
 *               to_user: {username, first_name, last_name, phone}}
 *
 * Makes sure that the currently-logged-in users is either the to or from user.
 *
 **/

router.get('/:id', async function(req, res, next) {
  let message = await Message.get(req.params.id);
  if (message.from_user.username === res.locals.user.username 
    || message.to_user.username === res.locals.user.username) {
    return res.json({ message });
  }
  throw new UnauthorizedError();
})


/** POST / - post message.
 *
 * {to_username, body} =>
 *   {message: {id, from_username, to_username, body, sent_at}}
 *
 **/

router.post('/', async function(req, res, next) {
  let { to_username, body } = req.body;
  let from_username = res.locals.user.username;
  let message;
  try {
    message = await Message.create({ from_username, to_username, body });
  } catch(err) {
    throw new BadRequestError();
  }
  return res.json({ message });
})


/** POST/:id/read - mark message as read:
 *
 *  => {message: {id, read_at}}
 *
 * Makes sure that the only the intended recipient can mark as read.
 *
 **/

router.post('/:id/read', async function(req, res, next) {
  let message = await Message.get(req.params.id);
  if (message.to_user.username === res.locals.user.username) {
    let readMessage = await Message.markRead(req.params.id);  
    return res.json({ message: readMessage });
  }
  throw new UnauthorizedError();
})


module.exports = router;