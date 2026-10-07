'use strict';

const { sendError } = require('../utils/response');

function notFoundHandler(req, res) {
  return sendError(res, {
    status: 404,
    message: `Ruta no encontrada: ${req.method} ${req.originalUrl}`,
    data: null,
  });
}

function errorHandler(err, req, res, next) {
  // eslint-disable-next-line no-unused-vars
  void next;

  if (process.env.NODE_ENV !== 'test') {
    console.error('[ERROR]', err);
  }

  if (err.code === 'P2002') {
    return sendError(res, {
      status: 409,
      message: 'El email ya está registrado',
      data: null,
    });
  }

  if (err.name === 'ZodError') {
    return sendError(res, {
      status: 400,
      message: err.errors?.[0]?.message || 'Datos no válidos',
      data: { errors: err.errors },
    });
  }

  const status = err.status || err.statusCode || 500;
  const message =
    status === 500 && process.env.NODE_ENV === 'production'
      ? 'Error interno del servidor'
      : err.message || 'Error interno del servidor';

  return sendError(res, { status, message, data: null });
}

module.exports = { notFoundHandler, errorHandler };
