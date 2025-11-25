import { Router } from 'express';
import categoriaController from '../controllers/categoria.controller';
import { authMiddleware } from '../middlewares/auth.middleware';

const router = Router();

router.use(authMiddleware);

// CRUD Costo Producto
router.get('/', categoriaController.findAll);
router.get('/:id', categoriaController.findById);
router.post('/', categoriaController.create);
router.put('/:id', categoriaController.update);

export default router;
