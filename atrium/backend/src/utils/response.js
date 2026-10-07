'use strict';

/**
 * Respuesta unificada de éxito.
 * Formato siempre: { success, message, data }
 */
function sendSuccess(res, { status = 200, message = 'Operación correcta', data = null } = {}) {
  return res.status(status).json({
    success: true,
    message,
    data,
  });
}

/**
 * Respuesta unificada de error.
 */
function sendError(res, { status = 500, message = 'Error interno del servidor', data = null } = {}) {
  return res.status(status).json({
    success: false,
    message,
    data,
  });
}

module.exports = { sendSuccess, sendError };
