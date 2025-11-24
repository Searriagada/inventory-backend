import { Router } from 'express';
import cadenaController from '../controllers/cadena.controller';
import { authMiddleware } from '../middlewares/auth.middleware';

const router = Router();

router.use(authMiddleware);

router.get('/', cadenaController.findAll);
router.get('/:id', cadenaController.findById);
router.post('/', cadenaController.create);
router.put('/:id', cadenaController.update);
router.delete('/:id', cadenaController.delete);

export default router;
