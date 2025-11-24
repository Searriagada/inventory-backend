import pool from '../config/database';

export interface PlataformaVenta {
  id_plataforma: number;
  nombre_plataforma: string;
  comision: number;
  status: 'activo' | 'inactivo';
  usuario?: string;
  created_at: Date;
  updated_at: Date;
}

export interface CreatePlataformaDto {
  nombre_plataforma: string;
  comision: number;
}

export interface UpdatePlataformaDto {
  nombre_plataforma?: string;
  comision?: number;
  status?: 'activo' | 'inactivo';
}

export class PlataformaVentaService {
  async findAll(status?: string): Promise<PlataformaVenta[]> {
    let query = 'SELECT * FROM plataforma_venta';
    const params: string[] = [];

    if (status) {
      query += ' WHERE status = $1';
      params.push(status);
    }

    query += ' ORDER BY nombre_plataforma ASC';

    const result = await pool.query(query, params);
    return result.rows;
  }

  async findById(id: number): Promise<PlataformaVenta | null> {
    const query = 'SELECT * FROM plataforma_venta WHERE id_plataforma = $1';
    const result = await pool.query(query, [id]);
    return result.rows[0] || null;
  }

  async create(data: CreatePlataformaDto, usuario: string): Promise<PlataformaVenta> {
    const query = `
      INSERT INTO plataforma_venta (nombre_plataforma, comision, usuario)
      VALUES ($1, $2, $3)
      RETURNING *
    `;
    const result = await pool.query(query, [data.nombre_plataforma, data.comision, usuario]);
    return result.rows[0];
  }

  async update(id: number, data: UpdatePlataformaDto, usuario: string): Promise<PlataformaVenta | null> {
    const fields: string[] = [];
    const values: any[] = [];
    let paramIndex = 1;

    if (data.nombre_plataforma !== undefined) {
      fields.push(`nombre_plataforma = $${paramIndex++}`);
      values.push(data.nombre_plataforma);
    }
    if (data.comision !== undefined) {
      fields.push(`comision = $${paramIndex++}`);
      values.push(data.comision);
    }
    if (data.status !== undefined) {
      fields.push(`status = $${paramIndex++}`);
      values.push(data.status);
    }

    fields.push(`usuario = $${paramIndex++}`);
    values.push(usuario);
    values.push(id);

    const query = `
      UPDATE plataforma_venta 
      SET ${fields.join(', ')}
      WHERE id_plataforma = $${paramIndex}
      RETURNING *
    `;

    const result = await pool.query(query, values);
    return result.rows[0] || null;
  }

  async delete(id: number): Promise<boolean> {
    const query = `UPDATE plataforma_venta SET status = 'inactivo' WHERE id_plataforma = $1`;
    const result = await pool.query(query, [id]);
    return (result.rowCount ?? 0) > 0;
  }
}

export default new PlataformaVentaService();
