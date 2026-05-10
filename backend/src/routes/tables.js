import { Router } from 'express';
import { MesaController } from '../controllers/MesaController.js';
import { authenticate } from '../middleware/auth.js';
import { requireAdmin } from '../middleware/authorize.js';

const router = Router();

router.get('/', authenticate, MesaController.getAll);
router.get('/estado', authenticate, MesaController.getByEstado);
router.get('/:id', authenticate, MesaController.getById);
router.post('/', authenticate, requireAdmin, MesaController.create);
router.put('/:id', authenticate, requireAdmin, MesaController.update);
router.patch('/:id/asignar', authenticate, requireAdmin, MesaController.assignMesero);
router.delete('/:id', authenticate, requireAdmin, MesaController.delete);

export default router;