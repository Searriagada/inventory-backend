import { Response } from 'express';
import { AuthRequest } from '../types';
import productoService from '../services/producto.service';

export class ProductoController {
  async findAll(req: AuthRequest, res: Response): Promise<void> {
    try {

      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 500;
      const search = req.query.search as string;
      const tipoProducto = req.query.tipoProducto ? parseInt(req.query.tipoProducto as string) : undefined;

      const resultado = await productoService.findAll(page, limit, search, tipoProducto);
      res.json({ success: true, data: resultado });
    } catch (error) {
      console.error('Error en findAll insumo:', error);
      res.status(500).json({ success: false, error: 'Error interno del servidor' });
    }
  }

  async findById(req: AuthRequest, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const producto = await productoService.findById(Number(id));

      if (!producto) {
        res.status(404).json({
          success: false,
          error: 'Producto no encontrado'
        });
        return;
      }

      res.json({
        success: true,
        data: producto
      });
    } catch (error) {
      console.error('Error en findById producto:', error);
      res.status(500).json({
        success: false,
        error: 'Error interno del servidor'
      });
    }
  }

  async create(req: AuthRequest, res: Response): Promise<void> {
    try {
      const { sku, nombre_producto, descripcion, precio_venta } = req.body;

      if (!sku || !nombre_producto || precio_venta === undefined) {
        res.status(400).json({
          success: false,
          error: 'SKU, nombre y precio de venta son requeridos'
        });
        return;
      }

      const existingSku = await productoService.findBySku(sku);
      if (existingSku) {
        res.status(400).json({
          success: false,
          error: 'El SKU ya existe'
        });
        return;
      }

      const usuario = req.user?.username || 'system';

      const producto = await productoService.create(
        { sku, nombre_producto, descripcion, precio_venta },
        usuario
      );

      res.status(201).json({
        success: true,
        data: producto,
        message: 'Producto creado exitosamente'
      });
    } catch (error) {
      console.error('Error en create producto:', error);
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

      // Verificar SKU único si se está actualizando
      if (req.body.sku) {
        const existingSku = await productoService.findBySku(req.body.sku);
        if (existingSku && existingSku.id_producto !== Number(id)) {
          res.status(400).json({
            success: false,
            error: 'El SKU ya existe en otro producto'
          });
          return;
        }
      }

      const producto = await productoService.update(Number(id), req.body, usuario);

      if (!producto) {
        res.status(404).json({
          success: false,
          error: 'Producto no encontrado'
        });
        return;
      }

      res.json({
        success: true,
        data: producto,
        message: 'Producto actualizado exitosamente'
      });
    } catch (error) {
      console.error('Error en update producto:', error);
      res.status(500).json({
        success: false,
        error: 'Error interno del servidor'
      });
    }
  }


  // Insumos del producto
  async getInsumos(req: AuthRequest, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const insumos = await productoService.getInsumos(Number(id));

      res.json({
        success: true,
        data: insumos
      });
    } catch (error) {
      console.error('Error en getInsumos:', error);
      res.status(500).json({
        success: false,
        error: 'Error interno del servidor'
      });
    }
  }

  async addInsumo(req: AuthRequest, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const { id_insumo, cantidad, neto, iva, total } = req.body;

      if (!id_insumo || cantidad === undefined) {
        res.status(400).json({
          success: false,
          error: 'ID de insumo y cantidad son requeridos'
        });
        return;
      }

      const usuario = req.user?.username || 'system';

      const productoInsumo = await productoService.addInsumo(
        Number(id),
        { id_insumo, cantidad, neto, iva, total },
        usuario
      );

      res.status(201).json({
        success: true,
        data: productoInsumo,
        message: 'Insumo agregado al producto exitosamente'
      });
    } catch (error) {
      console.error('Error en addInsumo:', error);
      res.status(500).json({
        success: false,
        error: 'Error interno del servidor'
      });
    }
  }

  async removeInsumo(req: AuthRequest, res: Response): Promise<void> {
    try {
      const { id, idInsumo } = req.params;
      const removed = await productoService.removeInsumo(Number(id), Number(idInsumo));

      if (!removed) {
        res.status(404).json({
          success: false,
          error: 'Relación producto-insumo no encontrada'
        });
        return;
      }

      res.json({
        success: true,
        message: 'Insumo removido del producto exitosamente'
      });
    } catch (error) {
      console.error('Error en removeInsumo:', error);
      res.status(500).json({
        success: false,
        error: 'Error interno del servidor'
      });
    }
  }
  async togglePublicadoML(req: AuthRequest, res: Response): Promise<void> {
    try {
      const { id, idProducto } = req.params;
      const usuario = (req as any).user?.username || 'sistema';

      const producto = await productoService.togglePublicadoML(Number(id), usuario);

      if (!producto) {
        res.status(404).json({ error: 'Producto no encontrado' });
        return;
      }

      res.json({
        message: 'Estado publicado_ml actualizado',
        data: producto
      });
    } catch (error) {
      console.error('Error al actualizar publicado_ml:', error);
      res.status(500).json({ error: 'Error al actualizar el estado' });
    }
  }


  async updatePublicadoML(req: AuthRequest, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const { publicado_ml } = req.body;
      const usuario = (req as any).user?.username || 'sistema';

      if (!publicado_ml || !['si', 'no'].includes(publicado_ml)) {
        res.status(400).json({ error: 'publicado_ml debe ser "si" o "no"' });
        return;
      }

      const producto = await productoService.updatePublicadoML(Number(id), publicado_ml, usuario);

      if (!producto) {
        res.status(404).json({ error: 'Producto no encontrado' });
        return;
      }

      res.json({
        message: 'Producto actualizado',
        data: producto
      });
    } catch (error) {
      console.error('Error al actualizar publicado_ml:', error);
      res.status(500).json({ error: 'Error al actualizar el producto' });
    }
  }

}

export default new ProductoController();
