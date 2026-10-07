'use strict';

const { prisma } = require('../config/prisma');
const { hashPassword } = require('../utils/password');

async function getFirstUsers(limit = 10) {
  return prisma.user.findMany({
    take: limit,
    orderBy: { createdAt: 'asc' },
    select: {
      id: true,
      name: true,
      email: true,
      createdAt: true,
      updatedAt: true,
    },
  });
}

async function findByEmail(email) {
  return prisma.user.findUnique({ where: { email } });
}

async function findById(id) {
  return prisma.user.findUnique({
    where: { id },
    select: {
      id: true,
      name: true,
      email: true,
      createdAt: true,
      updatedAt: true,
    },
  });
}

async function createUser({ name, email, password }) {
  const existing = await findByEmail(email);
  if (existing) {
    const err = new Error('El email ya está registrado');
    err.status = 409;
    throw err;
  }

  const hashed = await hashPassword(password);

  return prisma.user.create({
    data: { name, email, password: hashed },
    select: {
      id: true,
      name: true,
      email: true,
      createdAt: true,
      updatedAt: true,
    },
  });
}

async function updateName(userId, name) {
  return prisma.user.update({
    where: { id: userId },
    data: { name },
    select: {
      id: true,
      name: true,
      email: true,
      createdAt: true,
      updatedAt: true,
    },
  });
}

async function countUsers() {
  return prisma.user.count();
}

module.exports = {
  getFirstUsers,
  findByEmail,
  findById,
  createUser,
  updateName,
  countUsers,
};
