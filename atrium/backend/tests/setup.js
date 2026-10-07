'use strict';

process.env.NODE_ENV = 'test';
process.env.BCRYPT_ROUNDS = '4'; // faster in tests
process.env.TOKEN_TTL_DAYS = '7';
process.env.CORS_ORIGIN = 'http://localhost:5173';
process.env.PORT = '4001';
