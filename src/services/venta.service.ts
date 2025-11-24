import pool from '../config/database';

export interface Venta {
  id_venta: number;
  id_plataforma: number;
  id_cliente: number;
  costo_despacho: number;
  fecha_venta: Date;
  usuario?: string;
  created_at: Date;
  updated_at: Date;
}

export interface CreateVentaDto {
  id_plataforma: number;
  id_cliente: number;
  costo_despacho: number;
  fecha_venta: string;
}

export interface UpdateVentaDto {
  id_plataforma?: number;
  id_cliente?: number;
  costo_despacho?: number;
  fecha_venta?: string;
}

export class VentaService {
  async findAll(): Promise<any[]> {
    const query = `
      SELECT v.*, 
             p.nombre_plataforma,
             c.nombre_cliente
      FROM venta v
      JOIN plataforma_venta p ON v.id_plataforma = p.id_plataforma
      JOIN cliente c ON v.id_cliente = c.id_cliente
      ORDER BY v.fecha_venta DESC
    `;
    const result = await pool.query(query);
    return result.rows;
  }

  async findById(id: number): Promise<any | null> {
    const query = `
      SELECT v.*, 
             p.nombre_plataforma,
             c.nombre_cliente
      FROM venta v
      JOIN plataforma_venta p ON v.id_plataforma = p.id_plataforma
      JOIN cliente c ON v.id_cliente = c.id_cliente
      WHERE v.id_venta = $1
    `;
    const result = await pool.query(query, [id]);
    return result.rows[0] || null;
  }

  async create(data: CreateVentaDto, usuario: string): Promise<Venta> {
    const query = `
      INSERT INTO venta (id_plataforma, id_cliente, costo_despacho, fecha_venta, usuario)
      VALUES ($1, $2, $3, $4, $5)
      RETURNING *
    `;
    const result = await pool.query(query, [
      data.id_plataforma,
      data.id_cliente,
      data.costo_despacho,
      data.fecha_venta,
      usuario
    ]);
    return result.rows[0];
  }

  async update(id: number, data: UpdateVentaDto, usuario: string): Promise<Venta | null> {
    const fields: string[] = [];
    const values: any[] = [];
    let paramIndex = 1;

    if (data.id_plataforma !== undefined) {
      fields.push(`id_plataforma = $${paramIndex++}`);
      values.push(data.id_plataforma);
    }
    if (data.id_cliente !== undefined) {
      fields.push(`id_cliente = $${paramIndex++}`);
      values.push(data.id_cliente);
    }
    if (data.costo_despacho !== undefined) {
      fields.push(`costo_despacho = $${paramIndex++}`);
      values.push(data.costo_despacho);
    }
    if (data.fecha_venta !== undefined) {
      fields.push(`fecha_venta = $${paramIndex++}`);
      values.push(data.fecha_venta);
    }

    fields.push(`usuario = $${paramIndex++}`);
    values.push(usuario);
    values.push(id);

    const query = `
      UPDATE venta 
      SET ${fields.join(', ')}
      WHERE id_venta = $${paramIndex}
      RETURNING *
    `;

    const result = await pool.query(query, values);
    return result.rows[0] || null;
  }
}

export default new VentaService();
