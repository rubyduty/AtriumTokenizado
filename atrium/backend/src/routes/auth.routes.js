'use strict';

const { Router } = require('express');
const rateLimit = require('express-rate-limit');
const authController = require('../controllers/auth.controller');
const { validateBody } = require('../middleware/validate.middleware');
const { loginSchema } = require('../validators/user.validator');
const { env } = require('../config/env');

const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: env.loginRateLimit,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: 'Demasiados intentos de inicio de sesión. Inténtalo más tarde.',
    data: null,
  },
  skip: () => env.isTest,
});

const router = Router();
router.post('/login', loginLimiter, validateBody(loginSchema), authController.login);

module.exports = router;
