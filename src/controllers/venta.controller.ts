import { Response } from 'express';
import { AuthRequest } from '../types';
import ventaService from '../services/venta.service';

export class VentaController {
  async findAll(req: AuthRequest, res: Response): Promise<void> {
    try {
      const ventas = await ventaService.findAll();
      res.json({ success: true, data: ventas });
    } catch (error) {
      console.error('Error en findAll ventas:', error);
      res.status(500).json({ success: false, error: 'Error interno del servidor' });
    }
  }

  async findById(req: AuthRequest, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const venta = await ventaService.findById(Number(id));

      if (!venta) {
        res.status(404).json({ success: false, error: 'Venta no encontrada' });
        return;
      }

      res.json({ success: true, data: venta });
    } catch (error) {
      console.error('Error en findById venta:', error);
      res.status(500).json({ success: false, error: 'Error interno del servidor' });
    }
  }

  async create(req: AuthRequest, res: Response): Promise<void> {
    try {
      const { id_plataforma, id_cliente, costo_despacho, fecha_venta } = req.body;

      if (!id_plataforma || !id_cliente || costo_despacho === undefined || !fecha_venta) {
        res.status(400).json({
          success: false,
          error: 'Plataforma, cliente, costo de despacho y fecha de venta son requeridos'
        });
        return;
      }

      const usuario = req.user?.username || 'system';
      const venta = await ventaService.create(
        { id_plataforma, id_cliente, costo_despacho, fecha_venta },
        usuario
      );

      res.status(201).json({ success: true, data: venta, message: 'Venta creada exitosamente' });
    } catch (error: any) {

      if (error.code === '23503') {
        res.status(400).json({
          success: false,
          error: 'La plataforma o cliente especificado no existe'
        });
        return;
      }

      console.error('Error en create venta:', error);
      res.status(500).json({ success: false, error: 'Error interno del servidor' });
    }
  }

  async update(req: AuthRequest, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const usuario = req.user?.username || 'system';
      const venta = await ventaService.update(Number(id), req.body, usuario);

      if (!venta) {
        res.status(404).json({ success: false, error: 'Venta no encontrada' });
        return;
      }

      res.json({ success: true, data: venta, message: 'Venta actualizada exitosamente' });
    } catch (error: any) {

      if (error.code === '23503') {
        res.status(400).json({
          success: false,
          error: 'La plataforma o cliente especificado no existe'
        });
        return;
      }
      
      console.error('Error en update venta:', error);
      res.status(500).json({ success: false, error: 'Error interno del servidor' });
    }
  }
}

export default new VentaController();
