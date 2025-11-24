import pool from '../config/database';

export interface Cliente {
  id_cliente: number;
  nombre_cliente: string;
  usuario?: string;
  created_at: Date;
  updated_at: Date;
}

export interface CreateClienteDto {
  nombre_cliente: string;
}

export interface UpdateClienteDto {
  nombre_cliente?: string;
}

export class ClienteService {
  async findAll(): Promise<Cliente[]> {
    const query = 'SELECT * FROM cliente ORDER BY nombre_cliente ASC';
    const result = await pool.query(query);
    return result.rows;
  }

  async findById(id: number): Promise<Cliente | null> {
    const query = 'SELECT * FROM cliente WHERE id_cliente = $1';
    const result = await pool.query(query, [id]);
    return result.rows[0] || null;
  }

  async findByName(nombre_cliente: string): Promise<Cliente | null> {
    const query = 'SELECT * FROM cliente WHERE nombre_cliente = $1';
    const result = await pool.query(query, [nombre_cliente]);
    return result.rows[0] || null;
  }

  async create(data: CreateClienteDto, usuario: string): Promise<Cliente> {
    const query = `
      INSERT INTO cliente (nombre_cliente, usuario)
      VALUES ($1, $2)
      RETURNING *
    `;
    const result = await pool.query(query, [data.nombre_cliente, usuario]);
    return result.rows[0];
  }

  async update(id: number, data: UpdateClienteDto, usuario: string): Promise<Cliente | null> {
    const query = `
      UPDATE cliente 
      SET nombre_cliente = $1, usuario = $2
      WHERE id_cliente = $3
      RETURNING *
    `;
    const result = await pool.query(query, [data.nombre_cliente, usuario, id]);
    return result.rows[0] || null;
  }
}

export default new ClienteService();
