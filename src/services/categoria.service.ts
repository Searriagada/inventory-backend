import pool from '../config/database';

export interface Categoria {
  id_categoria: number;
  nombre_categoria: string;
}

export interface CreateCategoriaDto {
  nombre_categoria: string;
}

export interface UpdateCategoriaDto {
  nombre_categoria?: string;
}

export class CategoriaService {
  async findAll(status?: string): Promise<Categoria[]> {
    let query = 'SELECT * FROM categoria_insumo';
    const params: string[] = [];

    query += ' ORDER BY nombre_categoria ASC';

    const result = await pool.query(query, params);
    return result.rows;
  }

  async findById(id: number): Promise<Categoria | null> {
    const query = 'SELECT * FROM categoria_insumo WHERE id_categoria = $1';
    const result = await pool.query(query, [id]);
    return result.rows[0] || null;
  }

  async create(data: CreateCategoriaDto, usuario: string): Promise<Categoria> {
    const query = `
      INSERT INTO categoria_insumo (nombre_categoria)
      VALUES ($1)
      RETURNING *
    `;
    const result = await pool.query(query, [data.nombre_categoria]);
    return result.rows[0];
  }

  async update(id: number, data: UpdateCategoriaDto): Promise<Categoria | null> {
    const query = `
      UPDATE categoria_insumo 
      SET nombre_categoria = $2
      WHERE id_categoria = $1
      RETURNING *
    `;

    const result = await pool.query(query, [id, data.nombre_categoria]);
    return result.rows[0] || null;
  }
}

export default new CategoriaService();