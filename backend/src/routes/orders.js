import { Router } from 'express';
import { PedidoController } from '../controllers/PedidoController.js';
import { authenticate } from '../middleware/auth.js';
import { requireAdmin } from '../middleware/authorize.js';

const router = Router();

router.get('/', authenticate, PedidoController.getAll);
router.get('/stats', authenticate, requireAdmin, PedidoController.getStats);
router.get('/:id', authenticate, PedidoController.getById);
router.post('/', authenticate, PedidoController.create);
router.patch('/:id/status', authenticate, PedidoController.updateStatus);
router.patch('/:id/reasignar', authenticate, requireAdmin, PedidoController.reasignarMesero);
router.patch('/:id/pago', authenticate, PedidoController.updatePayment);

export default router;