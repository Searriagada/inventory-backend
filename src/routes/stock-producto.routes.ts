import { Router } from 'express';
import stockProductoController from '../controllers/stock-producto.controller';
import { authMiddleware } from '../middlewares/auth.middleware';

const router = Router();

router.use(authMiddleware);

router.get('/', stockProductoController.findAll);
router.get('/:idProducto', stockProductoController.findByProductoId);
router.post('/', stockProductoController.upsert);
router.patch('/:idProducto', stockProductoController.updateCantidad);

export default router;
