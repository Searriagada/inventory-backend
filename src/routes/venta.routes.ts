import { Router } from 'express';
import ventaController from '../controllers/venta.controller';
import { authMiddleware } from '../middlewares/auth.middleware';

const router = Router();

router.use(authMiddleware);

router.get('/', ventaController.findAll);
router.get('/:id', ventaController.findById);
router.post('/', ventaController.create);
router.put('/:id', ventaController.update);

export default router;
