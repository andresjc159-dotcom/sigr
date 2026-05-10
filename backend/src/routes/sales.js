import { Router } from 'express';
import { PedidoController } from '../controllers/PedidoController.js';
import { authenticate } from '../middleware/auth.js';
import { requireAdmin } from '../middleware/authorize.js';

const router = Router();

router.get('/', authenticate, PedidoController.getAll);
router.get('/stats', authenticate, requireAdmin, PedidoController.getStats);
router.get('/daily', authenticate, requireAdmin, async (req, res) => {
  const { PedidoModel } = await import('../models/Pedido.js');
  const stats = await PedidoModel.getStatsDaily();
  res.json(stats);
});
router.get('/weekly', authenticate, requireAdmin, async (req, res) => {
  const { PedidoModel } = await import('../models/Pedido.js');
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - 7);
  const stats = await PedidoModel.getStatsRange(startDate, new Date());
  res.json(stats);
});
router.get('/monthly', authenticate, requireAdmin, async (req, res) => {
  const { PedidoModel } = await import('../models/Pedido.js');
  const startDate = new Date();
  startDate.setMonth(startDate.getMonth() - 1);
  const stats = await PedidoModel.getStatsRange(startDate, new Date());
  res.json(stats);
});
router.get('/:id', authenticate, PedidoController.getById);
router.post('/', authenticate, PedidoController.create);
router.patch('/:id/status', authenticate, PedidoController.updateStatus);
router.patch('/:id/reasignar', authenticate, requireAdmin, PedidoController.reasignarMesero);
router.patch('/:id/pago', authenticate, PedidoController.updatePayment);

export default router;