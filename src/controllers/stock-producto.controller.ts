import { Response } from 'express';
import { AuthRequest } from '../types';
import stockProductoService from '../services/stock-producto.service';

export class StockProductoController {
  async findAll(req: AuthRequest, res: Response): Promise<void> {
    try {
      const stocks = await stockProductoService.findAll();
      res.json({ success: true, data: stocks });
    } catch (error) {
      console.error('Error en findAll stock productos:', error);
      res.status(500).json({ success: false, error: 'Error interno del servidor' });
    }
  }

  async findByProductoId(req: AuthRequest, res: Response): Promise<void> {
    try {
      const { idProducto } = req.params;
      const stock = await stockProductoService.findByProductoId(Number(idProducto));

      if (!stock) {
        res.status(404).json({ success: false, error: 'Stock no encontrado' });
        return;
      }

      res.json({ success: true, data: stock });
    } catch (error) {
      console.error('Error en findByProductoId:', error);
      res.status(500).json({ success: false, error: 'Error interno del servidor' });
    }
  }

  async upsert(req: AuthRequest, res: Response): Promise<void> {
    try {
      const { id_producto, cantidad } = req.body;

      if (!id_producto || cantidad === undefined) {
        res.status(400).json({ success: false, error: 'ID de producto y cantidad son requeridos' });
        return;
      }

      const usuario = req.user?.username || 'system';
      const stock = await stockProductoService.upsert(id_producto, cantidad, usuario);

      res.status(201).json({ success: true, data: stock, message: 'Stock actualizado exitosamente' });
    } catch (error) {
      console.error('Error en upsert stock producto:', error);
      res.status(500).json({ success: false, error: 'Error interno del servidor' });
    }
  }

  async updateCantidad(req: AuthRequest, res: Response): Promise<void> {
    try {
      const { idProducto } = req.params;
      const { cantidad } = req.body;

      if (cantidad === undefined) {
        res.status(400).json({ success: false, error: 'Cantidad es requerida' });
        return;
      }

      const usuario = req.user?.username || 'system';
      const stock = await stockProductoService.updateCantidad(Number(idProducto), cantidad, usuario);

      if (!stock) {
        res.status(404).json({ success: false, error: 'Stock no encontrado' });
        return;
      }

      res.json({ success: true, data: stock, message: 'Cantidad actualizada exitosamente' });
    } catch (error) {
      console.error('Error en updateCantidad:', error);
      res.status(500).json({ success: false, error: 'Error interno del servidor' });
    }
  }
}

export default new StockProductoController();
