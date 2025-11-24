import { Response } from 'express';
import { AuthRequest } from '../types';
import cajaService from '../services/caja.service';

export class CajaController {
  async findAll(req: AuthRequest, res: Response): Promise<void> {
    try {
      const { status } = req.query;
      const cajas = await cajaService.findAll(status as string);
      res.json({ success: true, data: cajas });
    } catch (error) {
      console.error('Error en findAll cajas:', error);
      res.status(500).json({ success: false, error: 'Error interno del servidor' });
    }
  }

  async findById(req: AuthRequest, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const caja = await cajaService.findById(Number(id));

      if (!caja) {
        res.status(404).json({ success: false, error: 'Caja no encontrada' });
        return;
      }

      res.json({ success: true, data: caja });
    } catch (error) {
      console.error('Error en findById caja:', error);
      res.status(500).json({ success: false, error: 'Error interno del servidor' });
    }
  }

  async create(req: AuthRequest, res: Response): Promise<void> {
    try {
      const { nombre_caja, precio } = req.body;

      if (!nombre_caja || precio === undefined) {
        res.status(400).json({ success: false, error: 'Nombre y precio son requeridos' });
        return;
      }

      const usuario = req.user?.username || 'system';
      const caja = await cajaService.create({ nombre_caja, precio }, usuario);

      res.status(201).json({ success: true, data: caja, message: 'Caja creada exitosamente' });
    } catch (error) {
      console.error('Error en create caja:', error);
      res.status(500).json({ success: false, error: 'Error interno del servidor' });
    }
  }

  async update(req: AuthRequest, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const usuario = req.user?.username || 'system';
      const caja = await cajaService.update(Number(id), req.body, usuario);

      if (!caja) {
        res.status(404).json({ success: false, error: 'Caja no encontrada' });
        return;
      }

      res.json({ success: true, data: caja, message: 'Caja actualizada exitosamente' });
    } catch (error) {
      console.error('Error en update caja:', error);
      res.status(500).json({ success: false, error: 'Error interno del servidor' });
    }
  }

  async delete(req: AuthRequest, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const deleted = await cajaService.delete(Number(id));

      if (!deleted) {
        res.status(404).json({ success: false, error: 'Caja no encontrada' });
        return;
      }

      res.json({ success: true, message: 'Caja eliminada exitosamente' });
    } catch (error) {
      console.error('Error en delete caja:', error);
      res.status(500).json({ success: false, error: 'Error interno del servidor' });
    }
  }
}

export default new CajaController();
