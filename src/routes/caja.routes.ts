import { Router } from 'express';
import cajaController from '../controllers/caja.controller';
import { authMiddleware } from '../middlewares/auth.middleware';

const router = Router();

router.use(authMiddleware);

router.get('/', cajaController.findAll);
router.get('/:id', cajaController.findById);
router.post('/', cajaController.create);
router.put('/:id', cajaController.update);
router.delete('/:id', cajaController.delete);

export default router;
