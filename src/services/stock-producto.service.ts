import pool from '../config/database';
import { StockProducto } from '../types';

export class StockProductoService {
  async findAll(): Promise<any[]> {
    const query = `
      SELECT sp.*, p.nombre_producto, p.sku
      FROM stock_producto sp
      JOIN producto p ON sp.id_producto = p.id_producto
      ORDER BY p.nombre_producto ASC
    `;
    const result = await pool.query(query);
    return result.rows;
  }

  async findByProductoId(idProducto: number): Promise<StockProducto | null> {
    const query = 'SELECT * FROM stock_producto WHERE id_producto = $1';
    const result = await pool.query(query, [idProducto]);
    return result.rows[0] || null;
  }

  async upsert(idProducto: number, cantidad: number, usuario: string): Promise<StockProducto> {
    const query = `
      INSERT INTO stock_producto (id_producto, cantidad, usuario)
      VALUES ($1, $2, $3)
      ON CONFLICT (id_producto)
      DO UPDATE SET cantidad = $2, usuario = $3
      RETURNING *
    `;
    const result = await pool.query(query, [idProducto, cantidad, usuario]);
    return result.rows[0];
  }

  async updateCantidad(idProducto: number, cantidad: number, usuario: string): Promise<StockProducto | null> {
    const query = `
      UPDATE stock_producto 
      SET cantidad = cantidad + $2, usuario = $3
      WHERE id_producto = $1
      RETURNING *
    `;
    const result = await pool.query(query, [idProducto, cantidad, usuario]);
    return result.rows[0] || null;
  }
}

export default new StockProductoService();
