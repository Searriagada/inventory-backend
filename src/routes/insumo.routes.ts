import { Router } from 'express';
import insumoController from '../controllers/insumo.controller';
import { authMiddleware } from '../middlewares/auth.middleware';

const router = Router();

router.use(authMiddleware);

router.get('/', insumoController.findAll);
router.get('/:id', insumoController.findById);
router.post('/', insumoController.create);
router.put('/:id', insumoController.update);
router.delete('/:id', insumoController.delete);

export default router;
