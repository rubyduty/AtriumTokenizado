'use strict';

const { prisma } = require('../config/prisma');
const { sendError } = require('../utils/response');

/**
 * Extrae Bearer token, lo busca en BD, comprueba expiración y carga el usuario.
 */
async function requireAuth(req, res, next) {
  try {
    const header = req.headers.authorization || '';
    const [scheme, token] = header.split(' ');

    if (!scheme || scheme.toLowerCase() !== 'bearer' || !token) {
      return sendError(res, {
        status: 401,
        message: 'Token no válido o sesión inexistente',
        data: null,
      });
    }

    const session = await prisma.token.findUnique({
      where: { token },
      include: { user: true },
    });

    if (!session) {
      return sendError(res, {
        status: 401,
        message: 'Token no válido o sesión inexistente',
        data: null,
      });
    }

    if (session.expiresAt < new Date()) {
      await prisma.token.delete({ where: { id: session.id } }).catch(() => {});
      return sendError(res, {
        status: 401,
        message: 'Token no válido o sesión inexistente',
        data: null,
      });
    }

    req.token = session;
    req.user = session.user;
    return next();
  } catch (error) {
    return next(error);
  }
}

module.exports = { requireAuth };
