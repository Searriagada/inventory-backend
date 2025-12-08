import { Response } from 'express';
import { AuthRequest } from '../types';
import cadenaService from '../services/cadena.service';

export class CadenaController {
  async findAll(req: AuthRequest, res: Response): Promise<void> {
    try {
      const { status } = req.query;
      const cadenas = await cadenaService.findAll(status as string);
      res.json({ success: true, data: cadenas });
    } catch (error) {
      console.error('Error en findAll cadenas:', error);
      res.status(500).json({ success: false, error: 'Error interno del servidor' });
    }
  }

  async findById(req: AuthRequest, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const cadena = await cadenaService.findById(Number(id));

      if (!cadena) {
        res.status(404).json({ success: false, error: 'Cadena no encontrada' });
        return;
      }

      res.json({ success: true, data: cadena });
    } catch (error) {
      console.error('Error en findById cadena:', error);
      res.status(500).json({ success: false, error: 'Error interno del servidor' });
    }
  }

  async create(req: AuthRequest, res: Response): Promise<void> {
    try {
      const { nombre_cadena } = req.body;

      if (!nombre_cadena) {
        res.status(400).json({ success: false, error: 'Nombre y precio son requeridos' });
        return;
      }

      const usuario = req.user?.username || 'system';
      const cadena = await cadenaService.create({ nombre_cadena, insumos: req.body.insumos }, usuario);

      res.status(201).json({ success: true, data: cadena, message: 'Cadena creada exitosamente' });
    } catch (error) {
      console.error('Error en create cadena:', error);
      res.status(500).json({ success: false, error: 'Error interno del servidor' });
    }
  }

  async update(req: AuthRequest, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const usuario = req.user?.username || 'system';
      const cadena = await cadenaService.update(Number(id), req.body, usuario);

      if (!cadena) {
        res.status(404).json({ success: false, error: 'Cadena no encontrada' });
        return;
      }

      res.json({ success: true, data: cadena, message: 'Cadena actualizada exitosamente' });
    } catch (error) {
      console.error('Error en update cadena:', error);
      res.status(500).json({ success: false, error: 'Error interno del servidor' });
    }
  }

  async delete(req: AuthRequest, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const deleted = await cadenaService.delete(Number(id));

      if (!deleted) {
        res.status(404).json({ success: false, error: 'Cadena no encontrada' });
        return;
      }

      res.json({ success: true, message: 'Cadena eliminada exitosamente' });
    } catch (error) {
      console.error('Error en delete cadena:', error);
      res.status(500).json({ success: false, error: 'Error interno del servidor' });
    }
  }
}

export default new CadenaController();
