'use strict';

const crypto = require('crypto');
const { env } = require('../config/env');

function generateSessionToken() {
  return crypto.randomBytes(32).toString('hex');
}

function computeExpiresAt(fromDate = new Date()) {
  const expires = new Date(fromDate);
  expires.setDate(expires.getDate() + env.tokenTtlDays);
  return expires;
}

module.exports = { generateSessionToken, computeExpiresAt };
