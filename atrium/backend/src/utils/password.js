'use strict';

const bcrypt = require('bcrypt');
const { env } = require('../config/env');

async function hashPassword(plain) {
  return bcrypt.hash(plain, env.bcryptRounds);
}

async function comparePassword(plain, hashed) {
  return bcrypt.compare(plain, hashed);
}

module.exports = { hashPassword, comparePassword };
