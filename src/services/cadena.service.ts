import pool from '../config/database';

export interface Cadena {
  id_cadena: number;
  nombre_cadena: string;
  precio: number;
  status: 'activo' | 'inactivo';
  usuario?: string;
  created_at: Date;
  updated_at: Date;
}

export interface CreateCadenaDto {
  nombre_cadena: string;
  precio: number;
}

export interface UpdateCadenaDto {
  nombre_cadena?: string;
  precio?: number;
  status?: 'activo' | 'inactivo';
}

export class CadenaService {
  async findAll(status?: string): Promise<Cadena[]> {
    let query = 'SELECT * FROM cadena';
    const params: string[] = [];

    if (status) {
      query += ' WHERE status = $1';
      params.push(status);
    }

    query += ' ORDER BY nombre_cadena ASC';

    const result = await pool.query(query, params);
    return result.rows;
  }

  async findById(id: number): Promise<Cadena | null> {
    const query = 'SELECT * FROM cadena WHERE id_cadena = $1';
    const result = await pool.query(query, [id]);
    return result.rows[0] || null;
  }

  async create(data: CreateCadenaDto, usuario: string): Promise<Cadena> {
    const query = `
      INSERT INTO cadena (nombre_cadena, precio, usuario)
      VALUES ($1, $2, $3)
      RETURNING *
    `;
    const result = await pool.query(query, [data.nombre_cadena, data.precio, usuario]);
    return result.rows[0];
  }

  async update(id: number, data: UpdateCadenaDto, usuario: string): Promise<Cadena | null> {
    const fields: string[] = [];
    const values: any[] = [];
    let paramIndex = 1;

    if (data.nombre_cadena !== undefined) {
      fields.push(`nombre_cadena = $${paramIndex++}`);
      values.push(data.nombre_cadena);
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
      UPDATE cadena 
      SET ${fields.join(', ')}
      WHERE id_cadena = $${paramIndex}
      RETURNING *
    `;

    const result = await pool.query(query, values);
    return result.rows[0] || null;
  }

  async delete(id: number): Promise<boolean> {
    const query = `UPDATE cadena SET status = 'inactivo' WHERE id_cadena = $1`;
    const result = await pool.query(query, [id]);
    return (result.rowCount ?? 0) > 0;
  }
}

export default new CadenaService();
