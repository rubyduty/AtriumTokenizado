'use strict';

require('./setup');

const request = require('supertest');
const { createApp } = require('../src/app');
const { prisma } = require('../src/config/prisma');

const app = createApp();

async function cleanDb() {
  await prisma.token.deleteMany();
  await prisma.user.deleteMany();
}

describe('Atrium API', () => {
  beforeAll(async () => {
    await prisma.$connect();
  });

  afterAll(async () => {
    await cleanDb();
    await prisma.$disconnect();
  });

  beforeEach(async () => {
    await cleanDb();
  });

  describe('GET /api/health', () => {
    it('devuelve status online', async () => {
      const res = await request(app).get('/api/health');
      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.status).toBe('online');
    });
  });

  describe('POST /api/users', () => {
    it('crea un usuario y hashea la contraseña', async () => {
      const res = await request(app)
        .post('/api/users')
        .send({
          name: 'Juan Pérez',
          email: 'juan@example.com',
          password: 'Password123!',
        });

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.message).toBe('Usuario creado correctamente');
      expect(res.body.data.email).toBe('juan@example.com');
      expect(res.body.data.password).toBeUndefined();
      expect(res.body.data.id).toBeDefined();

      const dbUser = await prisma.user.findUnique({ where: { email: 'juan@example.com' } });
      expect(dbUser.password).not.toBe('Password123!');
      expect(dbUser.password.startsWith('$2')).toBe(true);
    });

    it('rechaza email duplicado con 409', async () => {
      await request(app).post('/api/users').send({
        name: 'Juan',
        email: 'dup@example.com',
        password: 'Password123!',
      });

      const res = await request(app).post('/api/users').send({
        name: 'Otro',
        email: 'dup@example.com',
        password: 'Password123!',
      });

      expect(res.status).toBe(409);
      expect(res.body.success).toBe(false);
      expect(res.body.message).toMatch(/email/i);
      expect(res.body.data).toBeNull();
    });

    it('valida campos obligatorios', async () => {
      const res = await request(app).post('/api/users').send({ email: 'bad' });
      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
    });

    it('valida fortaleza de contraseña', async () => {
      const res = await request(app).post('/api/users').send({
        name: 'Test',
        email: 'weak@example.com',
        password: 'weak',
      });
      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
    });
  });

  describe('GET /api/users', () => {
    it('devuelve máximo 10 usuarios sin passwords', async () => {
      for (let i = 0; i < 12; i++) {
        await request(app).post('/api/users').send({
          name: `User ${i}`,
          email: `user${i}@example.com`,
          password: 'Password123!',
        });
      }

      const res = await request(app).get('/api/users');
      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.message).toBe('Usuarios obtenidos correctamente');
      expect(res.body.data).toHaveLength(10);
      res.body.data.forEach((u) => {
        expect(u.password).toBeUndefined();
        expect(u.email).toBeDefined();
        expect(u.name).toBeDefined();
      });
    });
  });

  describe('POST /api/auth/login', () => {
    beforeEach(async () => {
      await request(app).post('/api/users').send({
        name: 'Login User',
        email: 'login@example.com',
        password: 'Password123!',
      });
    });

    it('login correcto genera token y lo guarda', async () => {
      const res = await request(app).post('/api/auth/login').send({
        email: 'login@example.com',
        password: 'Password123!',
      });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.message).toBe('Inicio de sesión correcto');
      expect(res.body.data.token).toMatch(/^[a-f0-9]{64}$/);
      expect(res.body.data.user.email).toBe('login@example.com');
      expect(res.body.data.user.password).toBeUndefined();

      const stored = await prisma.token.findUnique({
        where: { token: res.body.data.token },
      });
      expect(stored).not.toBeNull();
      expect(stored.expiresAt.getTime()).toBeGreaterThan(Date.now());
    });

    it('credenciales incorrectas → 401', async () => {
      const res = await request(app).post('/api/auth/login').send({
        email: 'login@example.com',
        password: 'WrongPass1!',
      });

      expect(res.status).toBe(401);
      expect(res.body.success).toBe(false);
      expect(res.body.message).toBe('Credenciales incorrectas');
      expect(res.body.data).toBeNull();
    });

    it('usuario inexistente → 401 (mismo mensaje)', async () => {
      const res = await request(app).post('/api/auth/login').send({
        email: 'nobody@example.com',
        password: 'Password123!',
      });

      expect(res.status).toBe(401);
      expect(res.body.message).toBe('Credenciales incorrectas');
    });
  });

  describe('PATCH /api/users/name', () => {
    let token;

    beforeEach(async () => {
      await request(app).post('/api/users').send({
        name: 'Patch User',
        email: 'patch@example.com',
        password: 'Password123!',
      });
      const login = await request(app).post('/api/auth/login').send({
        email: 'patch@example.com',
        password: 'Password123!',
      });
      token = login.body.data.token;
    });

    it('actualiza el nombre con Bearer token', async () => {
      const res = await request(app)
        .patch('/api/users/name')
        .set('Authorization', `Bearer ${token}`)
        .send({ name: 'Nuevo Nombre' });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.name).toBe('Nuevo Nombre');
      expect(res.body.data.password).toBeUndefined();
    });

    it('token inválido → 401', async () => {
      const res = await request(app)
        .patch('/api/users/name')
        .set('Authorization', 'Bearer deadbeefdeadbeefdeadbeefdeadbeefdeadbeefdeadbeefdeadbeefdeadbeef')
        .send({ name: 'X' });

      expect(res.status).toBe(401);
      expect(res.body.success).toBe(false);
      expect(res.body.message).toBe('Token no válido o sesión inexistente');
      expect(res.body.data).toBeNull();
    });

    it('sin Authorization → 401', async () => {
      const res = await request(app).patch('/api/users/name').send({ name: 'X' });
      expect(res.status).toBe(401);
      expect(res.body.message).toBe('Token no válido o sesión inexistente');
    });

    it('valida nombre vacío', async () => {
      const res = await request(app)
        .patch('/api/users/name')
        .set('Authorization', `Bearer ${token}`)
        .send({ name: 'A' });

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
    });
  });
});
