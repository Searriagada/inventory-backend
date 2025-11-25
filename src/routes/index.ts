import { Router } from 'express';
import authRoutes from './auth.routes';
import insumoRoutes from './insumo.routes';
import productoRoutes from './producto.routes';
import stockInsumoRoutes from './stock-insumo.routes';
import stockProductoRoutes from './stock-producto.routes';
import cajaRoutes from './caja.routes';
import cadenaRoutes from './cadena.routes';
import plataformaVentaRoutes from './plataforma-venta.routes';
import clienteRoutes from './cliente.routes';
import ventaRoutes from './venta.routes';
import costoProductoRoutes from './costo-producto.routes';
import categoriaRoutes from './categoria-routes';

const router = Router();

router.use('/auth', authRoutes);
router.use('/insumos', insumoRoutes);
router.use('/productos', productoRoutes);
router.use('/stock-insumos', stockInsumoRoutes);
router.use('/stock-productos', stockProductoRoutes);
router.use('/cajas', cajaRoutes);
router.use('/cadenas', cadenaRoutes);
router.use('/plataformas', plataformaVentaRoutes);
router.use('/clientes', clienteRoutes);
router.use('/ventas', ventaRoutes);
router.use('/costos', costoProductoRoutes);
router.use('/categoria', categoriaRoutes);

export default router;
