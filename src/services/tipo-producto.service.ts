import pool from '../config/database';

export interface TipoProducto {
  id_tipo: number;
  nombre_tipo_producto: string;
}

export interface CreateTipoProductoDto {
  nombre_tipo_producto: string;
}

export interface UpdateTipoProductoDto {
  nombre_tipo_producto?: string;
}

export class TipoProductoService {
  async findAll(): Promise<TipoProducto[]> {
    const query = 'SELECT * FROM tipo_producto ORDER BY nombre_tipo_producto ASC';
    const result = await pool.query(query);
    return result.rows;
  }

  async findById(id: number): Promise<TipoProducto | null> {
    const query = 'SELECT * FROM tipo_producto WHERE id_tipo = $1';
    const result = await pool.query(query, [id]);
    return result.rows[0] || null;
  }

  async create(data: CreateTipoProductoDto, usuario: string): Promise<TipoProducto> {
    const query = `
      INSERT INTO tipo_producto (nombre_tipo_producto)
      VALUES ($1)
      RETURNING *
    `;
    const result = await pool.query(query, [data.nombre_tipo_producto]);
    return result.rows[0];
  }

  async update(id: number, data: UpdateTipoProductoDto): Promise<TipoProducto | null> {
    const query = `
      UPDATE tipo_producto 
      SET nombre_tipo_producto = $2
      WHERE id_tipo = $1
      RETURNING *
    `;
    const result = await pool.query(query, [id, data.nombre_tipo_producto]);
    return result.rows[0] || null;
  }
}

export default new TipoProductoService();