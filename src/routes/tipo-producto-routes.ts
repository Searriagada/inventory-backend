import { Router } from 'express';
import TipoProductoController from '../controllers/tipo-producto.controller';
import { authMiddleware } from '../middlewares/auth.middleware';

const router = Router();

router.use(authMiddleware);

// CRUD Tipo producto
router.get('/', TipoProductoController.findAll);
router.get('/:id', TipoProductoController.findById);
router.post('/', TipoProductoController.create);
router.put('/:id', TipoProductoController.update);

export default router;
