import { Router } from 'express';
import costoProductoController from '../controllers/costo-producto.controller';
import { authMiddleware } from '../middlewares/auth.middleware';

const router = Router();

router.use(authMiddleware);

// CRUD Costo Producto
router.get('/', costoProductoController.findAll);
router.get('/:id', costoProductoController.findById);
router.get('/producto/:idProducto', costoProductoController.findByProductoId);
router.post('/', costoProductoController.create);
router.put('/:id', costoProductoController.update);
router.delete('/:id', costoProductoController.delete);

// Insumos del costo
router.get('/:id/insumos', costoProductoController.getInsumos);
router.post('/:id/insumos', costoProductoController.addInsumo);
router.delete('/:id/insumos/:idInsumo', costoProductoController.removeInsumo);

export default router;
