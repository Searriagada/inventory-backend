import { Router } from 'express';
import stockInsumoController from '../controllers/stock-insumo.controller';
import { authMiddleware } from '../middlewares/auth.middleware';

const router = Router();

router.use(authMiddleware);

router.get('/', stockInsumoController.findAll);
router.get('/:idInsumo', stockInsumoController.findByInsumoId);
router.post('/', stockInsumoController.upsert);
router.patch('/:idInsumo', stockInsumoController.updateCantidad);

export default router;
