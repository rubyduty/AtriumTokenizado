'use strict';

const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcrypt');

const prisma = new PrismaClient();
const ROUNDS = Number(process.env.BCRYPT_ROUNDS || 12);
const DEMO_PASSWORD = 'Demo123!';

const demoUsers = [
  { name: 'Ana García', email: 'ana@atrium.dev' },
  { name: 'Carlos Ruiz', email: 'carlos@atrium.dev' },
  { name: 'María López', email: 'maria@atrium.dev' },
  { name: 'Demo User', email: 'demo@atrium.dev' },
  { name: 'Elena Martín', email: 'elena@atrium.dev' },
];

async function main() {
  console.log('Seeding Atrium database...');
  const hashed = await bcrypt.hash(DEMO_PASSWORD, ROUNDS);

  for (const u of demoUsers) {
    await prisma.user.upsert({
      where: { email: u.email },
      update: { name: u.name, password: hashed },
      create: { name: u.name, email: u.email, password: hashed },
    });
    console.log(`  ✓ ${u.email}`);
  }

  console.log(`\nContraseña demo para todos: ${DEMO_PASSWORD}`);
  console.log('Seed completado.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
