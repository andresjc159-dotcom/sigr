import { Router } from 'express';
import { EmployeeController } from '../controllers/EmployeeController.js';
import { authenticate } from '../middleware/auth.js';
import { requireMaster } from '../middleware/authorize.js';

const router = Router();

router.get('/', authenticate, requireMaster, EmployeeController.getAll);
router.get('/:id', authenticate, requireMaster, EmployeeController.getById);
router.post('/', authenticate, requireMaster, EmployeeController.create);
router.put('/:id', authenticate, requireMaster, EmployeeController.update);
router.patch('/:id/toggle', authenticate, requireMaster, EmployeeController.toggleStatus);

export default router;