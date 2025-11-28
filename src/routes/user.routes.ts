import { Router } from 'express';
import userController from '../controllers/user.controller';
import { validate } from '../middleware/validation';
import { CreateUserSchema, UpdateUserSchema } from '../types';

const router = Router();

router.post('/', validate(CreateUserSchema), userController.createUser);
router.get('/:id', userController.getUserById);
router.patch('/:id', validate(UpdateUserSchema), userController.updateUser);

export default router;

