'use strict';

const { z } = require('zod');

const createUserSchema = z.object({
  name: z
    .string({ required_error: 'El nombre es obligatorio' })
    .trim()
    .min(2, 'El nombre debe tener al menos 2 caracteres')
    .max(100, 'El nombre no puede superar 100 caracteres'),
  email: z
    .string({ required_error: 'El email es obligatorio' })
    .trim()
    .email('El email no es válido')
    .max(255, 'El email es demasiado largo')
    .transform((v) => v.toLowerCase()),
  password: z
    .string({ required_error: 'La contraseña es obligatoria' })
    .min(8, 'La contraseña debe tener al menos 8 caracteres')
    .max(128, 'La contraseña es demasiado larga')
    .regex(/[A-Z]/, 'La contraseña debe incluir al menos una mayúscula')
    .regex(/[a-z]/, 'La contraseña debe incluir al menos una minúscula')
    .regex(/[0-9]/, 'La contraseña debe incluir al menos un número')
    .regex(/[^A-Za-z0-9]/, 'La contraseña debe incluir al menos un carácter especial'),
});

const updateNameSchema = z.object({
  name: z
    .string({ required_error: 'El nombre es obligatorio' })
    .trim()
    .min(2, 'El nombre debe tener al menos 2 caracteres')
    .max(100, 'El nombre no puede superar 100 caracteres'),
});

const loginSchema = z.object({
  email: z
    .string({ required_error: 'El email es obligatorio' })
    .trim()
    .email('El email no es válido')
    .transform((v) => v.toLowerCase()),
  password: z
    .string({ required_error: 'La contraseña es obligatoria' })
    .min(1, 'La contraseña es obligatoria'),
});

module.exports = { createUserSchema, updateNameSchema, loginSchema };
