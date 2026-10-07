'use strict';

const { createApp } = require('./app');
const { env } = require('./config/env');
const { prisma } = require('./config/prisma');

async function bootstrap() {
  try {
    await prisma.$connect();
    const app = createApp();
    const server = app.listen(env.port, () => {
      console.log(`\n  Atrium API · http://localhost:${env.port}`);
      console.log(`  Health     · http://localhost:${env.port}/api/health`);
      console.log(`  Entorno    · ${env.nodeEnv}\n`);
    });

    const shutdown = async (signal) => {
      console.log(`\n${signal} recibido. Cerrando...`);
      server.close(async () => {
        await prisma.$disconnect();
        process.exit(0);
      });
    };

    process.on('SIGINT', () => shutdown('SIGINT'));
    process.on('SIGTERM', () => shutdown('SIGTERM'));
  } catch (error) {
    console.error('No se pudo iniciar el servidor:', error);
    await prisma.$disconnect().catch(() => {});
    process.exit(1);
  }
}

bootstrap();
