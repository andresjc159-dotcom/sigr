import { Router } from 'express';
import { ConfigVisualController } from '../controllers/ConfigVisualController.js';
import { authenticate } from '../middleware/auth.js';
import { requireMaster } from '../middleware/authorize.js';
import { upload } from '../config/multer.js';

const router = Router();

router.get('/theme', ConfigVisualController.getTheme);
router.put('/theme', authenticate, requireMaster, ConfigVisualController.updateTheme);
router.post('/upload/logo', authenticate, requireMaster, upload.single('logo'), ConfigVisualController.uploadLogo);
router.post('/upload/logo-blanco', authenticate, requireMaster, upload.single('logo_blanco'), ConfigVisualController.uploadLogo);
router.post('/upload/favicon', authenticate, requireMaster, upload.single('favicon'), ConfigVisualController.uploadLogo);

export default router;