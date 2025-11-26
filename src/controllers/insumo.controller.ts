import { Response } from 'express';
import { AuthRequest } from '../types';
import insumoService from '../services/insumo.service';

export class InsumoController {
  async findAll(req: AuthRequest, res: Response): Promise<void> {
  try {

    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 5;
    const search = req.query.search as string;
    const categoryId = req.query.categoryId ? parseInt(req.query.categoryId as string) : undefined;

    const resultado = await insumoService.findAll(page, limit, search, categoryId);
    res.json({ success: true, data: resultado });
  } catch (error) {
    console.error('Error en findAll insumo:', error);
    res.status(500).json({ success: false, error: 'Error interno del servidor' });
  }
}

  async findById(req: AuthRequest, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const insumo = await insumoService.findById(Number(id));

      if (!insumo) {
        res.status(404).json({
          success: false,
          error: 'Insumo no encontrado'
        });
        return;
      }

      res.json({
        success: true,
        data: insumo
      });
    } catch (error) {
      console.error('Error en findById insumo:', error);
      res.status(500).json({
        success: false,
        error: 'Error interno del servidor'
      });
    }
  }

  async create(req: AuthRequest, res: Response): Promise<void> {
    try {
      const { nombre_insumo, id_categoria, precio_insumo, link_insumo } = req.body;

      if (!nombre_insumo) {
        res.status(400).json({
          success: false,
          error: 'El nombre del insumo es requerido'
        });
        return;
      }

      const usuario = req.user?.username || 'system';

      const insumo = await insumoService.create(
        { nombre_insumo, id_categoria, precio_insumo, link_insumo },
        usuario
      );

      res.status(201).json({
        success: true,
        data: insumo,
        message: 'Insumo creado exitosamente'
      });
    } catch (error) {
      console.error('Error en create insumo:', error);
      res.status(500).json({
        success: false,
        error: 'Error interno del servidor'
      });
    }
  }

  async update(req: AuthRequest, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const usuario = req.user?.username || 'system';

      const insumo = await insumoService.update(Number(id), req.body, usuario);

      if (!insumo) {
        res.status(404).json({
          success: false,
          error: 'Insumo no encontrado'
        });
        return;
      }

      res.json({
        success: true,
        data: insumo,
        message: 'Insumo actualizado exitosamente'
      });
    } catch (error) {
      console.error('Error en update insumo:', error);
      res.status(500).json({
        success: false,
        error: 'Error interno del servidor'
      });
    }
  }

  async delete(req: AuthRequest, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const deleted = await insumoService.delete(Number(id));

      if (!deleted) {
        res.status(404).json({
          success: false,
          error: 'Insumo no encontrado'
        });
        return;
      }

      res.json({
        success: true,
        message: 'Insumo eliminado exitosamente'
      });
    } catch (error) {
      console.error('Error en delete insumo:', error);
      res.status(500).json({
        success: false,
        error: 'Error interno del servidor'
      });
    }
  }
}

export default new InsumoController();
