import { Response } from 'express';
import { AuthRequest } from '../types';
import categoriaService from '../services/categoria.service';

export class CategoriaController {
  async findAll(req: AuthRequest, res: Response): Promise<void> {
    try {
      const { status } = req.query;
      const categorias = await categoriaService.findAll(status as string);
      res.json({ success: true, data: categorias });
    } catch (error) {
      console.error('Error en findAll categorías:', error);
      res.status(500).json({ success: false, error: 'Error interno del servidor' });
    }
  }

  async findById(req: AuthRequest, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const categoria = await categoriaService.findById(Number(id));

      if (!categoria) {
        res.status(404).json({ success: false, error: 'Categoría no encontrada' });
        return;
      }

      res.json({ success: true, data: categoria });
    } catch (error) {
      console.error('Error en findById categoría:', error);
      res.status(500).json({ success: false, error: 'Error interno del servidor' });
    }
  }

  async create(req: AuthRequest, res: Response): Promise<void> {
    try {
      const { nombre_categoria } = req.body;

      if (!nombre_categoria) {
        res.status(400).json({ success: false, error: 'El nombre de la categoría es requerido' });
        return;
      }

      const usuario = req.user?.username || 'system';
      const categoria = await categoriaService.create(
        { nombre_categoria },
        usuario
      );

      res
        .status(201)
        .json({ success: true, data: categoria, message: 'Categoría creada exitosamente' });
    } catch (error) {
      console.error('Error en create categoría:', error);
      res.status(500).json({ success: false, error: 'Error interno del servidor' });
    }
  }

  async update(req: AuthRequest, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const categoria = await categoriaService.update(Number(id), req.body);

      if (!categoria) {
        res.status(404).json({ success: false, error: 'Categoría no encontrada' });
        return;
      }

      res.json({ success: true, data: categoria, message: 'Categoría actualizada exitosamente' });
    } catch (error) {
      console.error('Error en update categoría:', error);
      res.status(500).json({ success: false, error: 'Error interno del servidor' });
    }
  }
}

export default new CategoriaController();