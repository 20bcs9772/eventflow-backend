import { Router } from 'express';
import authController from '../controllers/auth.controller';
import { verifyFirebaseToken } from '../middleware/auth';
import { validate } from '../middleware/validation';
import { RegisterSchema, UpdateProfileSchema } from '../types';

const router = Router();

// All routes require Firebase token verification
router.use(verifyFirebaseToken);

// POST /api/auth/register - Register new user
router.post('/register', validate(RegisterSchema), authController.register);

// POST /api/auth/login - Login existing user (or create for social)
router.post('/login', authController.login);

// GET /api/auth/me - Get current user profile
router.get('/me', authController.getCurrentUser);

// PATCH /api/auth/profile - Update profile
router.patch('/profile', validate(UpdateProfileSchema), authController.updateProfile);

// DELETE /api/auth/account - Delete account
router.delete('/account', authController.deleteAccount);

// POST /api/auth/verify - Verify token validity
router.post('/verify', authController.verifyToken);

export default router;

