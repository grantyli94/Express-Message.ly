"use strict";
const bcrypt = require('bcrypt');
const { BCRYPT_WORK_FACTOR } = require('../config');
const db = require('../db');
const { UnauthorizedError, NotFoundError } = require('../expressError');

/** User of the site. */

class User {

  /** Register new user. Returns
   *    {username, password, first_name, last_name, phone}
   */

  static async register({ username, password, first_name, last_name, phone }) {
    const hashedPassword = await bcrypt.hash(password, BCRYPT_WORK_FACTOR);
    const join_at = new Date();
   
    const result = await db.query(
      `INSERT INTO users (username, password, first_name, last_name, phone, join_at, last_login_at)
        VALUES ($1, $2, $3, $4, $5, $6, $7)
        RETURNING username, password, first_name, last_name, phone`,
    [username, hashedPassword, first_name, last_name, phone, join_at, join_at]);
    return result.rows[0];
  }

  /** Authenticate: is username/password valid? Returns boolean. */

  static async authenticate(username, password) {
    const result = await db.query(
      `SELECT password
          FROM users
          WHERE username = $1`,
      [username]);
    const user = result.rows[0];

    if (user) {
      if (await bcrypt.compare(password, user.password) === true) {
        return true;
      }
    }

    return false;

  }


  /** Update last_login_at for user */

  static async updateLoginTimestamp(username) {
    const last_login_at = new Date();
    const result = await db.query(
      `UPDATE users 
      SET last_login_at = $1
      WHERE username = $2
      RETURNING username, last_login_at`,
      [last_login_at, username]
    );

    return result.rows[0];
  }

  /** All: basic info on all users:
   * [{username, first_name, last_name}, ...] */

  static async all() {
    const result = await db.query(
      `SELECT username, first_name, last_name
      FROM users`
    );
    return result.rows;
  }

  /** Get: get user by username
   *
   * returns {username,
   *          first_name,
   *          last_name,
   *          phone,
   *          join_at,
   *          last_login_at } */

  static async get(username) {
    const result = await db.query(
      `SELECT username,
              first_name,
              last_name,
              phone,
              join_at,
              last_login_at
      FROM users
      WHERE username = $1`,
      [username]);
    return result.rows[0];
  }

  /** Return messages from this user.
   *
   * [{id, to_user, body, sent_at, read_at}]
   *
   * where to_user is
   *   {username, first_name, last_name, phone}
   */

  static async messagesFrom(username) {
    const results = await db.query(
      `SELECT id, to_username AS to_user, body, sent_at, read_at
      FROM messages
      WHERE from_username = $1`,
      [username]);
    
    for (let result of results.rows) {
      let to_user = result.to_user;

      result.to_user = await User._getUser(to_user);
    }
  
      return results.rows;
  }

  /** Return messages to this user.
   *
   * [{id, from_user, body, sent_at, read_at}]
   *
   * where from_user is
   *   {username, first_name, last_name, phone}
   */

  static async messagesTo(username) {
    const results = await db.query(
      `SELECT id, from_username AS from_user, body, sent_at, read_at
      FROM messages
      WHERE to_username = $1`,
      [username]);
    
    for (let result of results.rows) {
      let from_user = result.from_user;

      result.from_user = await User._getUser(from_user);
    }
  
      return results.rows;
  }

  /** Helper Function to get a user {username, first_name, last_name, phone} */
  static async _getUser(username) {
    const userResult = await db.query(
      `SELECT username, first_name, last_name, phone
      FROM users
      WHERE username = $1`,
      [username]);

      return userResult.rows[0];
  }
}



module.exports = User;
