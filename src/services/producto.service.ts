import pool from '../config/database';
import { Producto, CreateProductoDto, UpdateProductoDto, CreateProductoInsumoDto } from '../types';

export class ProductoService {
  async findAll(status?: string): Promise<Producto[]> {
    let query = 'SELECT * FROM producto';
    const params: string[] = [];

    if (status) {
      query += ' WHERE status = $1';
      params.push(status);
    }

    query += ' ORDER BY nombre_producto ASC';

    const result = await pool.query(query, params);
    return result.rows;
  }

  async findById(id: number): Promise<Producto | null> {
    const query = 'SELECT * FROM producto WHERE id_producto = $1';
    const result = await pool.query(query, [id]);
    return result.rows[0] || null;
  }

  async findBySku(sku: string): Promise<Producto | null> {
    const query = 'SELECT * FROM producto WHERE sku = $1';
    const result = await pool.query(query, [sku]);
    return result.rows[0] || null;
  }

  async create(data: CreateProductoDto, usuario: string): Promise<Producto> {
    const query = `
      INSERT INTO producto (sku, nombre_producto, descripcion, precio_venta, usuario)
      VALUES ($1, $2, $3, $4, $5)
      RETURNING *
    `;

    const result = await pool.query(query, [
      data.sku,
      data.nombre_producto,
      data.descripcion || null,
      data.precio_venta,
      usuario
    ]);

    return result.rows[0];
  }

  async update(id: number, data: UpdateProductoDto, usuario: string): Promise<Producto | null> {
    const fields: string[] = [];
    const values: any[] = [];
    let paramIndex = 1;

    if (data.sku !== undefined) {
      fields.push(`sku = $${paramIndex++}`);
      values.push(data.sku);
    }
    if (data.nombre_producto !== undefined) {
      fields.push(`nombre_producto = $${paramIndex++}`);
      values.push(data.nombre_producto);
    }
    if (data.descripcion !== undefined) {
      fields.push(`descripcion = $${paramIndex++}`);
      values.push(data.descripcion);
    }
    if (data.precio_venta !== undefined) {
      fields.push(`precio_venta = $${paramIndex++}`);
      values.push(data.precio_venta);
    }
    if (data.status !== undefined) {
      fields.push(`status = $${paramIndex++}`);
      values.push(data.status);
    }

    fields.push(`usuario = $${paramIndex++}`);
    values.push(usuario);

    values.push(id);

    const query = `
      UPDATE producto 
      SET ${fields.join(', ')}
      WHERE id_producto = $${paramIndex}
      RETURNING *
    `;

    const result = await pool.query(query, values);
    return result.rows[0] || null;
  }

  async delete(id: number): Promise<boolean> {
    const query = `
      UPDATE producto 
      SET status = 'inactivo'
      WHERE id_producto = $1
    `;
    const result = await pool.query(query, [id]);
    return (result.rowCount ?? 0) > 0;
  }

  // Insumos del producto
  async getInsumos(idProducto: number): Promise<any[]> {
    const query = `
      SELECT pi.*, i.nombre_insumo, i.precio_insumo
      FROM producto_insumo pi
      JOIN insumo i ON pi.id_insumo = i.id_insumo
      WHERE pi.id_producto = $1
    `;
    const result = await pool.query(query, [idProducto]);
    return result.rows;
  }

  async addInsumo(
    idProducto: number,
    data: CreateProductoInsumoDto,
    usuario: string
  ): Promise<any> {
    const query = `
      INSERT INTO producto_insumo (id_producto, id_insumo, cantidad, neto, iva, total, usuario)
      VALUES ($1, $2, $3, $4, $5, $6, $7)
      ON CONFLICT (id_producto, id_insumo) 
      DO UPDATE SET cantidad = $3, neto = $4, iva = $5, total = $6, usuario = $7
      RETURNING *
    `;

    const result = await pool.query(query, [
      idProducto,
      data.id_insumo,
      data.cantidad,
      data.neto || null,
      data.iva || null,
      data.total || null,
      usuario
    ]);

    return result.rows[0];
  }

  async removeInsumo(idProducto: number, idInsumo: number): Promise<boolean> {
    const query = `
      DELETE FROM producto_insumo 
      WHERE id_producto = $1 AND id_insumo = $2
    `;
    const result = await pool.query(query, [idProducto, idInsumo]);
    return (result.rowCount ?? 0) > 0;
  }
}

export default new ProductoService();
