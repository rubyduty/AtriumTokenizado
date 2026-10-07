'use strict';

const { Router } = require('express');
const userController = require('../controllers/user.controller');
const { validateBody } = require('../middleware/validate.middleware');
const { requireAuth } = require('../middleware/auth.middleware');
const { createUserSchema, updateNameSchema } = require('../validators/user.validator');

const router = Router();

router.get('/', userController.getUsers);
router.post('/', validateBody(createUserSchema), userController.createUser);
router.patch('/name', requireAuth, validateBody(updateNameSchema), userController.updateName);

module.exports = router;
