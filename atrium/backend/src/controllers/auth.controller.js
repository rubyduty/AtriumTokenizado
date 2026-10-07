'use strict';

const authService = require('../services/auth.service');
const { sendSuccess, sendError } = require('../utils/response');

async function login(req, res, next) {
  try {
    const { email, password } = req.body;
    const result = await authService.login(email, password);
    return sendSuccess(res, {
      status: 200,
      message: 'Inicio de sesión correcto',
      data: {
        token: result.token,
        user: result.user,
        expiresAt: result.expiresAt,
      },
    });
  } catch (error) {
    if (error.status === 401) {
      return sendError(res, {
        status: 401,
        message: 'Credenciales incorrectas',
        data: null,
      });
    }
    return next(error);
  }
}

module.exports = { login };
