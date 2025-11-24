import { Router } from 'express';
import plataformaVentaController from '../controllers/plataforma-venta.controller';
import { authMiddleware } from '../middlewares/auth.middleware';

const router = Router();

router.use(authMiddleware);

router.get('/', plataformaVentaController.findAll);
router.get('/:id', plataformaVentaController.findById);
router.post('/', plataformaVentaController.create);
router.put('/:id', plataformaVentaController.update);
router.delete('/:id', plataformaVentaController.delete);

export default router;
