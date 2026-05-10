import { Router } from 'express';
import { AuthController } from '../controllers/AuthController.js';
import { authenticate, refreshToken } from '../middleware/auth.js';

const router = Router();

router.post('/login', AuthController.login);
router.post('/register', AuthController.register);
router.post('/refresh', refreshToken);
router.get('/profile', authenticate, AuthController.profile);
router.post('/logout', authenticate, AuthController.logout);
router.put('/password', authenticate, AuthController.changePassword);

export default router;