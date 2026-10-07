'use strict';

const { sendError } = require('../utils/response');

/**
 * Middleware de validación con Zod.
 * Valida req.body contra el schema y reemplaza body con datos parseados.
 */
function validateBody(schema) {
  return (req, res, next) => {
    const result = schema.safeParse(req.body);
    if (!result.success) {
      const details = result.error.errors.map((e) => ({
        field: e.path.join('.') || 'body',
        message: e.message,
      }));
      return sendError(res, {
        status: 400,
        message: details[0]?.message || 'Datos de entrada no válidos',
        data: { errors: details },
      });
    }
    req.body = result.data;
    return next();
  };
}

module.exports = { validateBody };
