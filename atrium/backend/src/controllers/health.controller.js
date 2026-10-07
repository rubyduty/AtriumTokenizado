'use strict';

const { sendSuccess, sendError } = require('../utils/response');
const { prisma } = require('../config/prisma');

async function getHealth(req, res) {
  try {
    await prisma.$queryRaw`SELECT 1`;
    return sendSuccess(res, {
      status: 200,
      message: 'API operativa',
      data: { status: 'online', database: 'connected' },
    });
  } catch (error) {
    return sendError(res, {
      status: 500,
      message: 'API con problemas de conectividad',
      data: { status: 'degraded', database: 'disconnected' },
    });
  }
}

module.exports = { getHealth };
