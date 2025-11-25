import pool from '../config/database';
import { StockInsumo } from '../types';

export class StockInsumoService {
  async findAll(): Promise<any[]> {
    const query = `
      SELECT si.*, i.nombre_insumo 
      FROM stock_insumo si
      JOIN insumo i ON si.id_insumo = i.id_insumo
      ORDER BY i.nombre_insumo ASC
    `;
    const result = await pool.query(query);
    return result.rows;
  }

  async findByInsumoId(idInsumo: number): Promise<StockInsumo | null> {
    const query = 'SELECT * FROM stock_insumo WHERE id_insumo = $1';
    const result = await pool.query(query, [idInsumo]);
    return result.rows[0] || null;
  }

  async upsert(idInsumo: number, cantidad: number, usuario: string): Promise<StockInsumo> {
    const query = `
      INSERT INTO stock_insumo (id_insumo, cantidad, usuario)
      VALUES ($1, $2, $3)
      ON CONFLICT (id_insumo)
      DO UPDATE SET cantidad = $2, usuario = $3
      RETURNING *
    `;
    const result = await pool.query(query, [idInsumo, cantidad, usuario]);
    return result.rows[0];
  }

  async updateCantidad(idInsumo: number, cantidad: number, usuario: string): Promise<StockInsumo | null> {
    const query = `
      UPDATE stock_insumo 
      SET cantidad = $2, usuario = $3
      WHERE id_insumo = $1
      RETURNING *
    `;
    const result = await pool.query(query, [idInsumo, cantidad, usuario]);
    return result.rows[0] || null;
  }
}

export default new StockInsumoService();
