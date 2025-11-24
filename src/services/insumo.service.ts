import pool from '../config/database';
import { Insumo, CreateInsumoDto, UpdateInsumoDto } from '../types';

export class InsumoService {
  async findAll(status?: string): Promise<Insumo[]> {
    let query = 'SELECT * FROM insumo';
    const params: string[] = [];

    if (status) {
      query += ' WHERE status = $1';
      params.push(status);
    }

    query += ' ORDER BY nombre_insumo ASC';

    const result = await pool.query(query, params);
    return result.rows;
  }

  async findById(id: number): Promise<Insumo | null> {
    const query = 'SELECT * FROM insumo WHERE id_insumo = $1';
    const result = await pool.query(query, [id]);
    return result.rows[0] || null;
  }

  async create(data: CreateInsumoDto, usuario: string): Promise<Insumo> {
    const query = `
      INSERT INTO insumo (nombre_insumo, categoria_insumo, precio_insumo, link_insumo, usuario)
      VALUES ($1, $2, $3, $4, $5)
      RETURNING *
    `;

    const result = await pool.query(query, [
      data.nombre_insumo,
      data.categoria_insumo || null,
      data.precio_insumo || null,
      data.link_insumo || null,
      usuario
    ]);

    return result.rows[0];
  }

  async update(id: number, data: UpdateInsumoDto, usuario: string): Promise<Insumo | null> {
    const fields: string[] = [];
    const values: any[] = [];
    let paramIndex = 1;

    if (data.nombre_insumo !== undefined) {
      fields.push(`nombre_insumo = $${paramIndex++}`);
      values.push(data.nombre_insumo);
    }
    if (data.categoria_insumo !== undefined) {
      fields.push(`categoria_insumo = $${paramIndex++}`);
      values.push(data.categoria_insumo);
    }
    if (data.precio_insumo !== undefined) {
      fields.push(`precio_insumo = $${paramIndex++}`);
      values.push(data.precio_insumo);
    }
    if (data.link_insumo !== undefined) {
      fields.push(`link_insumo = $${paramIndex++}`);
      values.push(data.link_insumo);
    }
    if (data.status !== undefined) {
      fields.push(`status = $${paramIndex++}`);
      values.push(data.status);
    }

    fields.push(`usuario = $${paramIndex++}`);
    values.push(usuario);

    values.push(id);

    const query = `
      UPDATE insumo 
      SET ${fields.join(', ')}
      WHERE id_insumo = $${paramIndex}
      RETURNING *
    `;

    const result = await pool.query(query, values);
    return result.rows[0] || null;
  }

  async delete(id: number): Promise<boolean> {
    const query = `
      UPDATE insumo 
      SET status = 'inactivo'
      WHERE id_insumo = $1
    `;
    const result = await pool.query(query, [id]);
    return (result.rowCount ?? 0) > 0;
  }
}

export default new InsumoService();
