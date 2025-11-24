import { Response } from 'express';
import { AuthRequest } from '../types';
import insumoService from '../services/insumo.service';

export class InsumoController {
  async findAll(req: AuthRequest, res: Response): Promise<void> {
    try {
      const { status } = req.query;
      const insumos = await insumoService.findAll(status as string);

      res.json({
        success: true,
        data: insumos
      });
    } catch (error) {
      console.error('Error en findAll insumos:', error);
      res.status(500).json({
        success: false,
        error: 'Error interno del servidor'
      });
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
      const { nombre_insumo, categoria_insumo, precio_insumo, link_insumo } = req.body;

      if (!nombre_insumo) {
        res.status(400).json({
          success: false,
          error: 'El nombre del insumo es requerido'
        });
        return;
      }

      const usuario = req.user?.username || 'system';

      const insumo = await insumoService.create(
        { nombre_insumo, categoria_insumo, precio_insumo, link_insumo },
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
