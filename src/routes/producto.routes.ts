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
router.get('/:id/costo', productoController.getCostoVenta);
router.put('/:id/stock', productoController.updateStockProducto);


// Insumos del producto
router.get('/:id/insumos', productoController.getInsumos);
router.put('/:id/insumos', productoController.addInsumos);
router.get('/:id/embalajes', productoController.getEmbalaje);
router.put('/:id/embalajes', productoController.addEmbalaje);

// Obtener todos los productos como insumos
router.get('/as-insumos/all', productoController.findAllProductoAsInsumo);
router.get('/as-insumos/:id', productoController.findProductoAsInsumoById);

export default router;
