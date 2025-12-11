import { Router } from 'express';
import productoController from '../controllers/producto.controller';
import { authMiddleware } from '../middlewares/auth.middleware';

const router = Router();

router.use(authMiddleware);

// CRUD Producto
router.get('/', productoController.findAll);
router.get('/:id', productoController.findById);
router.post('/', productoController.create);
router.put('/:id', productoController.update);
router.patch('/:id/toggle-publicado-ml', productoController.togglePublicadoML);
router.put('/:id/publicado-ml', productoController.updatePublicadoML);


// Insumos del producto
router.get('/:id/insumos', productoController.getInsumos);
router.post('/:id/insumos', productoController.addInsumo);
router.delete('/:id/insumos/:idInsumo', productoController.removeInsumo);

export default router;
