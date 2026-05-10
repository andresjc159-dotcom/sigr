import { Router } from 'express';
import { ReservaController } from '../controllers/ReservaController.js';
import { authenticate } from '../middleware/auth.js';
import { requireAdmin } from '../middleware/authorize.js';

const router = Router();

router.get('/', authenticate, ReservaController.getAll);
router.get('/availability', ReservaController.getAvailability);
router.get('/fecha', authenticate, ReservaController.getByFecha);
router.get('/:id', authenticate, ReservaController.getById);
router.post('/', ReservaController.create);
router.put('/:id', authenticate, requireAdmin, ReservaController.update);

export default router;