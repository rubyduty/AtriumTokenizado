'use strict';

const userService = require('../services/user.service');
const { sendSuccess, sendError } = require('../utils/response');

async function getUsers(req, res, next) {
  try {
    const users = await userService.getFirstUsers(10);
    return sendSuccess(res, {
      status: 200,
      message: 'Usuarios obtenidos correctamente',
      data: users,
    });
  } catch (error) {
    return next(error);
  }
}

async function createUser(req, res, next) {
  try {
    const { name, email, password } = req.body;
    const user = await userService.createUser({ name, email, password });
    return sendSuccess(res, {
      status: 201,
      message: 'Usuario creado correctamente',
      data: user,
    });
  } catch (error) {
    if (error.status === 409) {
      return sendError(res, {
        status: 409,
        message: error.message,
        data: null,
      });
    }
    return next(error);
  }
}

async function updateName(req, res, next) {
  try {
    const { name } = req.body;
    const user = await userService.updateName(req.user.id, name);
    return sendSuccess(res, {
      status: 200,
      message: 'Nombre actualizado correctamente',
      data: user,
    });
  } catch (error) {
    return next(error);
  }
}

module.exports = { getUsers, createUser, updateName };
