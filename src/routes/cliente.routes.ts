import { Router } from 'express';
import clienteController from '../controllers/cliente.controller';
import { authMiddleware } from '../middlewares/auth.middleware';

const router = Router();

router.use(authMiddleware);

router.get('/', clienteController.findAll);
router.get('/:id', clienteController.findById);
router.post('/', clienteController.create);
router.put('/:id', clienteController.update);

export default router;
