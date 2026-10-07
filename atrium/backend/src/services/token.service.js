'use strict';

const { prisma } = require('../config/prisma');
const { generateSessionToken, computeExpiresAt } = require('../utils/token');

async function createTokenForUser(userId) {
  const tokenValue = generateSessionToken();
  const expiresAt = computeExpiresAt();

  return prisma.token.create({
    data: {
      token: tokenValue,
      userId,
      expiresAt,
    },
  });
}

async function findValidToken(tokenValue) {
  const session = await prisma.token.findUnique({
    where: { token: tokenValue },
    include: { user: true },
  });

  if (!session) return null;
  if (session.expiresAt < new Date()) {
    await prisma.token.delete({ where: { id: session.id } }).catch(() => {});
    return null;
  }
  return session;
}

async function revokeToken(tokenValue) {
  try {
    await prisma.token.delete({ where: { token: tokenValue } });
    return true;
  } catch {
    return false;
  }
}

async function revokeAllForUser(userId) {
  await prisma.token.deleteMany({ where: { userId } });
}

module.exports = {
  createTokenForUser,
  findValidToken,
  revokeToken,
  revokeAllForUser,
};
