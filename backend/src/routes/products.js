import { Router } from 'express';
import { CategoriaController, ProductoController } from '../controllers/ProductoController.js';
import { authenticate } from '../middleware/auth.js';
import { requireMaster, requireAdmin } from '../middleware/authorize.js';

const router = Router();

router.get('/productos', ProductoController.getAll);
router.get('/productos/destacados', ProductoController.getDestacados);
router.get('/productos/search', ProductoController.search);
router.get('/productos/bajo-stock', authenticate, requireAdmin, ProductoController.getLowStock);
router.get('/productos/:id', ProductoController.getById);
router.post('/productos', authenticate, requireMaster, ProductoController.create);
router.put('/productos/:id', authenticate, requireMaster, ProductoController.update);
router.delete('/productos/:id', authenticate, requireMaster, ProductoController.delete);

router.get('/categorias', CategoriaController.getAll);
router.get('/categorias/:id', CategoriaController.getById);
router.post('/categorias', authenticate, requireMaster, CategoriaController.create);
router.put('/categorias/:id', authenticate, requireMaster, CategoriaController.update);
router.delete('/categorias/:id', authenticate, requireMaster, CategoriaController.delete);

export default router;