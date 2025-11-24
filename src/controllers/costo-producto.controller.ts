import { Response } from 'express';
import { AuthRequest } from '../types';
import costoProductoService from '../services/costo-producto.service';

export class CostoProductoController {
  async findAll(req: AuthRequest, res: Response): Promise<void> {
    try {
      const costos = await costoProductoService.findAll();
      res.json({ success: true, data: costos });
    } catch (error) {
      console.error('Error en findAll costos:', error);
      res.status(500).json({ success: false, error: 'Error interno del servidor' });
    }
  }

  async findById(req: AuthRequest, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const costo = await costoProductoService.findById(Number(id));

      if (!costo) {
        res.status(404).json({ success: false, error: 'Costo no encontrado' });
        return;
      }

      res.json({ success: true, data: costo });
    } catch (error) {
      console.error('Error en findById costo:', error);
      res.status(500).json({ success: false, error: 'Error interno del servidor' });
    }
  }

  async findByProductoId(req: AuthRequest, res: Response): Promise<void> {
    try {
      const { idProducto } = req.params;
      const costos = await costoProductoService.findByProductoId(Number(idProducto));
      res.json({ success: true, data: costos });
    } catch (error) {
      console.error('Error en findByProductoId:', error);
      res.status(500).json({ success: false, error: 'Error interno del servidor' });
    }
  }

  async create(req: AuthRequest, res: Response): Promise<void> {
    try {
      const { id_producto, id_caja, id_cadena, id_plataforma, neto, iva, total } = req.body;

      if (!id_producto || !id_caja || !id_cadena || !id_plataforma) {
        res.status(400).json({ 
          success: false, 
          error: 'Producto, caja, cadena y plataforma son requeridos' 
        });
        return;
      }

      const usuario = req.user?.username || 'system';
      const costo = await costoProductoService.create(
        { id_producto, id_caja, id_cadena, id_plataforma, neto, iva, total },
        usuario
      );

      res.status(201).json({ success: true, data: costo, message: 'Costo creado exitosamente' });
    } catch (error) {
      console.error('Error en create costo:', error);
      res.status(500).json({ success: false, error: 'Error interno del servidor' });
    }
  }

  async update(req: AuthRequest, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const usuario = req.user?.username || 'system';
      const costo = await costoProductoService.update(Number(id), req.body, usuario);

      if (!costo) {
        res.status(404).json({ success: false, error: 'Costo no encontrado' });
        return;
      }

      res.json({ success: true, data: costo, message: 'Costo actualizado exitosamente' });
    } catch (error) {
      console.error('Error en update costo:', error);
      res.status(500).json({ success: false, error: 'Error interno del servidor' });
    }
  }

  async delete(req: AuthRequest, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const deleted = await costoProductoService.delete(Number(id));

      if (!deleted) {
        res.status(404).json({ success: false, error: 'Costo no encontrado' });
        return;
      }

      res.json({ success: true, message: 'Costo eliminado exitosamente' });
    } catch (error) {
      console.error('Error en delete costo:', error);
      res.status(500).json({ success: false, error: 'Error interno del servidor' });
    }
  }

  // Insumos del costo
  async getInsumos(req: AuthRequest, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const insumos = await costoProductoService.getInsumos(Number(id));
      res.json({ success: true, data: insumos });
    } catch (error) {
      console.error('Error en getInsumos:', error);
      res.status(500).json({ success: false, error: 'Error interno del servidor' });
    }
  }

  async addInsumo(req: AuthRequest, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const { id_insumo, cantidad } = req.body;

      if (!id_insumo || cantidad === undefined) {
        res.status(400).json({ success: false, error: 'ID de insumo y cantidad son requeridos' });
        return;
      }

      const usuario = req.user?.username || 'system';
      const insumoCosto = await costoProductoService.addInsumo(Number(id), id_insumo, cantidad, usuario);

      res.status(201).json({ success: true, data: insumoCosto, message: 'Insumo agregado al costo exitosamente' });
    } catch (error) {
      console.error('Error en addInsumo:', error);
      res.status(500).json({ success: false, error: 'Error interno del servidor' });
    }
  }

  async removeInsumo(req: AuthRequest, res: Response): Promise<void> {
    try {
      const { id, idInsumo } = req.params;
      const removed = await costoProductoService.removeInsumo(Number(id), Number(idInsumo));

      if (!removed) {
        res.status(404).json({ success: false, error: 'Relación costo-insumo no encontrada' });
        return;
      }

      res.json({ success: true, message: 'Insumo removido del costo exitosamente' });
    } catch (error) {
      console.error('Error en removeInsumo:', error);
      res.status(500).json({ success: false, error: 'Error interno del servidor' });
    }
  }
}

export default new CostoProductoController();
