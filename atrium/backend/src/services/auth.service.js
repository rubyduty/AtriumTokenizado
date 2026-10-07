'use strict';

const userService = require('./user.service');
const tokenService = require('./token.service');
const { comparePassword } = require('../utils/password');
const { serializeUser } = require('../utils/user.serializer');

async function login(email, password) {
  const user = await userService.findByEmail(email);

  if (!user) {
    const err = new Error('Credenciales incorrectas');
    err.status = 401;
    throw err;
  }

  const valid = await comparePassword(password, user.password);
  if (!valid) {
    const err = new Error('Credenciales incorrectas');
    err.status = 401;
    throw err;
  }

  const session = await tokenService.createTokenForUser(user.id);

  return {
    token: session.token,
    user: serializeUser(user),
    expiresAt: session.expiresAt,
  };
}

module.exports = { login };
