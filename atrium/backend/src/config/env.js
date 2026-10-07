'use strict';

const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.resolve(__dirname, '../../.env') });

function requireEnv(key, fallback) {
  const value = process.env[key] ?? fallback;
  if (value === undefined || value === '') {
    throw new Error(`Variable de entorno requerida: ${key}`);
  }
  return value;
}

const env = {
  nodeEnv: process.env.NODE_ENV || 'development',
  port: Number(process.env.PORT || 4000),
  databaseUrl: requireEnv('DATABASE_URL'),
  corsOrigin: process.env.CORS_ORIGIN || 'http://localhost:5173',
  bcryptRounds: Number(process.env.BCRYPT_ROUNDS || 12),
  tokenTtlDays: Number(process.env.TOKEN_TTL_DAYS || 7),
  loginRateLimit: Number(process.env.LOGIN_RATE_LIMIT || 20),
  isTest: process.env.NODE_ENV === 'test',
};

module.exports = { env };
