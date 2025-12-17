import { Router } from 'express';
import userController from '../controllers/user.controller';
import { validate } from '../middleware/validation';
import { CreateUserSchema, UpdateUserSchema } from '../types';
import { verifyFirebaseToken, requireAdmin } from '../middleware/auth';

const router = Router();

// All user management endpoints are admin-only
router.use(verifyFirebaseToken, requireAdmin);

router.post('/', validate(CreateUserSchema), userController.createUser);
router.get('/', userController.listUsers);
router.get('/:id', userController.getUserById);
router.patch('/:id', validate(UpdateUserSchema), userController.updateUser);
router.delete('/:id', userController.deleteUser);

export default router;

