import { Response } from 'express';
import { AuthRequest } from '../types';
import stockInsumoService from '../services/stock-insumo.service';

export class StockInsumoController {
  async findAll(req: AuthRequest, res: Response): Promise<void> {
    try {
      const stocks = await stockInsumoService.findAll();
      res.json({ success: true, data: stocks });
    } catch (error) {
      console.error('Error en findAll stock insumos:', error);
      res.status(500).json({ success: false, error: 'Error interno del servidor' });
    }
  }

  async findByInsumoId(req: AuthRequest, res: Response): Promise<void> {
    try {
      const { idInsumo } = req.params;
      const stock = await stockInsumoService.findByInsumoId(Number(idInsumo));

      if (!stock) {
        res.status(404).json({ success: false, error: 'Stock no encontrado' });
        return;
      }

      res.json({ success: true, data: stock });
    } catch (error) {
      console.error('Error en findByInsumoId:', error);
      res.status(500).json({ success: false, error: 'Error interno del servidor' });
    }
  }

  async upsert(req: AuthRequest, res: Response): Promise<void> {
    try {
      const { id_insumo, cantidad } = req.body;

      if (!id_insumo || cantidad === undefined) {
        res.status(400).json({ success: false, error: 'ID de insumo y cantidad son requeridos' });
        return;
      }

      const usuario = req.user?.username || 'system';
      const stock = await stockInsumoService.upsert(id_insumo, cantidad, usuario);

      res.status(201).json({ success: true, data: stock, message: 'Stock actualizado exitosamente' });
    } catch (error) {
      console.error('Error en upsert stock insumo:', error);
      res.status(500).json({ success: false, error: 'Error interno del servidor' });
    }
  }

  async updateCantidad(req: AuthRequest, res: Response): Promise<void> {
    try {
      const { idInsumo } = req.params;
      const { cantidad } = req.body;

      if (cantidad === undefined) {
        res.status(400).json({ success: false, error: 'Cantidad es requerida' });
        return;
      }

      const usuario = req.user?.username || 'system';
      const stock = await stockInsumoService.updateCantidad(Number(idInsumo), cantidad, usuario);

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

export default new StockInsumoController();
