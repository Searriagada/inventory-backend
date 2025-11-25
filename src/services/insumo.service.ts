import pool from '../config/database';
import { Insumo, CreateInsumoDto, UpdateInsumoDto } from '../types';

export class InsumoService {
  async findAll(): Promise<Insumo[]> {
    const query = `
      SELECT 
        i.id_insumo, 
        i.nombre_insumo, 
        i.id_categoria, 
        c.nombre_categoria, 
        i.precio_insumo, 
        i.link_insumo, 
        i.status, 
        s.cantidad 
      FROM insumo i 
      INNER JOIN stock_insumo s ON i.id_insumo = s.id_insumo 
      LEFT JOIN categoria c ON i.id_categoria = c.id_categoria 
      ORDER BY i.nombre_insumo ASC
    `;

    const result = await pool.query(query);
    return result.rows;
  }

  async findById(id: number): Promise<Insumo | null> {
    const query = `
      SELECT 
        i.id_insumo, 
        i.nombre_insumo, 
        i.id_categoria, 
        c.nombre_categoria, 
        i.precio_insumo, 
        i.link_insumo, 
        i.status,
        s.cantidad
      FROM insumo i 
      LEFT JOIN stock_insumo s ON i.id_insumo = s.id_insumo 
      LEFT JOIN categoria c ON i.id_categoria = c.id_categoria 
      WHERE i.id_insumo = $1
    `;
    const result = await pool.query(query, [id]);
    return result.rows[0] || null;
  }

  async create(data: CreateInsumoDto, usuario: string): Promise<Insumo> {
    const client = await pool.connect();
    try {
      await client.query('BEGIN');

      const insertInsumoQuery = `
        INSERT INTO insumo (nombre_insumo, id_categoria, precio_insumo, link_insumo, usuario)
        VALUES ($1, $2, $3, $4, $5)
        RETURNING id_insumo
      `;

      const insumoResult = await client.query(insertInsumoQuery, [
        data.nombre_insumo,
        data.id_categoria ?? null,
        data.precio_insumo ?? null,
        data.link_insumo ?? null,
        usuario
      ]);

      const idInsumo = insumoResult.rows[0].id_insumo;

      const insertStockQuery = `
        INSERT INTO stock_insumo (id_insumo, cantidad, usuario)
        VALUES ($1, $2, $3)
      `;

      await client.query(insertStockQuery, [idInsumo, 0, usuario]);
      await client.query('COMMIT');

      const fullInsumo = await this.findById(idInsumo);
      return fullInsumo!;
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  }

  async update(id: number, data: UpdateInsumoDto, usuario: string): Promise<Insumo | null> {
    const fields: string[] = [];
    const values: any[] = [];
    let paramIndex = 1;

    if (data.nombre_insumo !== undefined) {
      fields.push(`nombre_insumo = $${paramIndex++}`);
      values.push(data.nombre_insumo);
    }
    if (data.id_categoria !== undefined) {
      fields.push(`id_categoria = $${paramIndex++}`);
      values.push(data.id_categoria);
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

    if (fields.length === 0) {
      return this.findById(id);
    }

    fields.push(`usuario = $${paramIndex++}`);
    values.push(usuario);
    values.push(id);

    const query = `
      UPDATE insumo 
      SET ${fields.join(', ')}
      WHERE id_insumo = $${paramIndex}
    `;

    await pool.query(query, values);
    return this.findById(id);
  }

  async delete(id: number): Promise<boolean> {
    const query = `UPDATE insumo SET status = 'inactivo' WHERE id_insumo = $1`;
    const result = await pool.query(query, [id]);
    return (result.rowCount ?? 0) > 0;
  }
}

export default new InsumoService();