import { Response } from 'express';
import { AuthRequest } from '../types';
import tipoProductoService from '../services/tipo-producto.service';

export class TipoProductoController {
  async findAll(req: AuthRequest, res: Response): Promise<void> {
    try {
      const tiposProducto = await tipoProductoService.findAll();
      res.json({ success: true, data: tiposProducto });
    } catch (error) {
      console.error('Error en findAll tipos de producto:', error);
      res.status(500).json({ success: false, error: 'Error interno del servidor' });
    }
  }

  async findById(req: AuthRequest, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const tipoProducto = await tipoProductoService.findById(Number(id));

      if (!tipoProducto) {
        res.status(404).json({ success: false, error: 'Tipo de producto no encontrado' });
        return;
      }

      res.json({ success: true, data: tipoProducto });
    } catch (error) {
      console.error('Error en findById tipo de producto:', error);
      res.status(500).json({ success: false, error: 'Error interno del servidor' });
    }
  }

  async create(req: AuthRequest, res: Response): Promise<void> {
    try {
      const { nombre_tipo_producto } = req.body;

      if (!nombre_tipo_producto) {
        res.status(400).json({ success: false, error: 'El nombre del tipo de producto es requerido' });
        return;
      }

      const usuario = req.user?.username || 'system';
      const tipoProducto = await tipoProductoService.create(
        { nombre_tipo_producto },
        usuario
      );

      res
        .status(201)
        .json({ success: true, data: tipoProducto, message: 'Tipo de producto creado exitosamente' });
    } catch (error) {
      console.error('Error en create tipo de producto:', error);
      res.status(500).json({ success: false, error: 'Error interno del servidor' });
    }
  }

  async update(req: AuthRequest, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const tipoProducto = await tipoProductoService.update(Number(id), req.body);

      if (!tipoProducto) {
        res.status(404).json({ success: false, error: 'Tipo de producto no encontrado' });
        return;
      }

      res.json({ success: true, data: tipoProducto, message: 'Tipo de producto actualizado exitosamente' });
    } catch (error) {
      console.error('Error en update tipo de producto:', error);
      res.status(500).json({ success: false, error: 'Error interno del servidor' });
    }
  }
}

export default new TipoProductoController();
