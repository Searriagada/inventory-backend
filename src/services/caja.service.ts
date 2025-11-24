import pool from '../config/database';

export interface Caja {
  id_caja: number;
  nombre_caja: string;
  precio: number;
  status: 'activo' | 'inactivo';
  usuario?: string;
  created_at: Date;
  updated_at: Date;
}

export interface CreateCajaDto {
  nombre_caja: string;
  precio: number;
}

export interface UpdateCajaDto {
  nombre_caja?: string;
  precio?: number;
  status?: 'activo' | 'inactivo';
}

export class CajaService {
  async findAll(status?: string): Promise<Caja[]> {
    let query = 'SELECT * FROM caja';
    const params: string[] = [];

    if (status) {
      query += ' WHERE status = $1';
      params.push(status);
    }

    query += ' ORDER BY nombre_caja ASC';

    const result = await pool.query(query, params);
    return result.rows;
  }

  async findById(id: number): Promise<Caja | null> {
    const query = 'SELECT * FROM caja WHERE id_caja = $1';
    const result = await pool.query(query, [id]);
    return result.rows[0] || null;
  }

  async create(data: CreateCajaDto, usuario: string): Promise<Caja> {
    const query = `
      INSERT INTO caja (nombre_caja, precio, usuario)
      VALUES ($1, $2, $3)
      RETURNING *
    `;
    const result = await pool.query(query, [data.nombre_caja, data.precio, usuario]);
    return result.rows[0];
  }

  async update(id: number, data: UpdateCajaDto, usuario: string): Promise<Caja | null> {
    const fields: string[] = [];
    const values: any[] = [];
    let paramIndex = 1;

    if (data.nombre_caja !== undefined) {
      fields.push(`nombre_caja = $${paramIndex++}`);
      values.push(data.nombre_caja);
    }
    if (data.precio !== undefined) {
      fields.push(`precio = $${paramIndex++}`);
      values.push(data.precio);
    }
    if (data.status !== undefined) {
      fields.push(`status = $${paramIndex++}`);
      values.push(data.status);
    }

    fields.push(`usuario = $${paramIndex++}`);
    values.push(usuario);
    values.push(id);

    const query = `
      UPDATE caja 
      SET ${fields.join(', ')}
      WHERE id_caja = $${paramIndex}
      RETURNING *
    `;

    const result = await pool.query(query, values);
    return result.rows[0] || null;
  }

  async delete(id: number): Promise<boolean> {
    const query = `UPDATE caja SET status = 'inactivo' WHERE id_caja = $1`;
    const result = await pool.query(query, [id]);
    return (result.rowCount ?? 0) > 0;
  }
}

export default new CajaService();
