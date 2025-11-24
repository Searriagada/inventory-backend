import { Response } from 'express';
import { AuthRequest } from '../types';
import plataformaVentaService from '../services/plataforma-venta.service';

export class PlataformaVentaController {
  async findAll(req: AuthRequest, res: Response): Promise<void> {
    try {
      const { status } = req.query;
      const plataformas = await plataformaVentaService.findAll(status as string);
      res.json({ success: true, data: plataformas });
    } catch (error) {
      console.error('Error en findAll plataformas:', error);
      res.status(500).json({ success: false, error: 'Error interno del servidor' });
    }
  }

  async findById(req: AuthRequest, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const plataforma = await plataformaVentaService.findById(Number(id));

      if (!plataforma) {
        res.status(404).json({ success: false, error: 'Plataforma no encontrada' });
        return;
      }

      res.json({ success: true, data: plataforma });
    } catch (error) {
      console.error('Error en findById plataforma:', error);
      res.status(500).json({ success: false, error: 'Error interno del servidor' });
    }
  }

  async create(req: AuthRequest, res: Response): Promise<void> {
    try {
      const { nombre_plataforma, comision } = req.body;

      if (!nombre_plataforma || comision === undefined) {
        res.status(400).json({ success: false, error: 'Nombre y comisión son requeridos' });
        return;
      }

      const usuario = req.user?.username || 'system';
      const plataforma = await plataformaVentaService.create({ nombre_plataforma, comision }, usuario);

      res.status(201).json({ success: true, data: plataforma, message: 'Plataforma creada exitosamente' });
    } catch (error) {
      console.error('Error en create plataforma:', error);
      res.status(500).json({ success: false, error: 'Error interno del servidor' });
    }
  }

  async update(req: AuthRequest, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const usuario = req.user?.username || 'system';
      const plataforma = await plataformaVentaService.update(Number(id), req.body, usuario);

      if (!plataforma) {
        res.status(404).json({ success: false, error: 'Plataforma no encontrada' });
        return;
      }

      res.json({ success: true, data: plataforma, message: 'Plataforma actualizada exitosamente' });
    } catch (error) {
      console.error('Error en update plataforma:', error);
      res.status(500).json({ success: false, error: 'Error interno del servidor' });
    }
  }

  async delete(req: AuthRequest, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const deleted = await plataformaVentaService.delete(Number(id));

      if (!deleted) {
        res.status(404).json({ success: false, error: 'Plataforma no encontrada' });
        return;
      }

      res.json({ success: true, message: 'Plataforma eliminada exitosamente' });
    } catch (error) {
      console.error('Error en delete plataforma:', error);
      res.status(500).json({ success: false, error: 'Error interno del servidor' });
    }
  }
}

export default new PlataformaVentaController();
