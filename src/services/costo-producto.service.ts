import pool from '../config/database';

export interface CostoProducto {
  id_costo: number;
  id_producto: number;
  id_caja: number;
  id_cadena: number;
  id_plataforma: number;
  neto?: number;
  iva?: number;
  total?: number;
  usuario?: string;
  created_at: Date;
  updated_at: Date;
}

export interface CreateCostoProductoDto {
  id_producto: number;
  id_caja: number;
  id_cadena: number;
  id_plataforma: number;
  neto?: number;
  iva?: number;
  total?: number;
}

export interface UpdateCostoProductoDto {
  id_caja?: number;
  id_cadena?: number;
  id_plataforma?: number;
  neto?: number;
  iva?: number;
  total?: number;
}

export class CostoProductoService {
  async findAll(): Promise<any[]> {
    const query = `
      SELECT cp.*,
             p.nombre_producto, p.sku,
             ca.nombre_caja,
             cd.nombre_cadena,
             pv.nombre_plataforma
      FROM costo_producto cp
      JOIN producto p ON cp.id_producto = p.id_producto
      JOIN caja ca ON cp.id_caja = ca.id_caja
      JOIN cadena cd ON cp.id_cadena = cd.id_cadena
      JOIN plataforma_venta pv ON cp.id_plataforma = pv.id_plataforma
      ORDER BY p.nombre_producto ASC
    `;
    const result = await pool.query(query);
    return result.rows;
  }

  async findById(id: number): Promise<any | null> {
    const query = `
      SELECT cp.*,
             p.nombre_producto, p.sku,
             ca.nombre_caja,
             cd.nombre_cadena,
             pv.nombre_plataforma
      FROM costo_producto cp
      JOIN producto p ON cp.id_producto = p.id_producto
      JOIN caja ca ON cp.id_caja = ca.id_caja
      JOIN cadena cd ON cp.id_cadena = cd.id_cadena
      JOIN plataforma_venta pv ON cp.id_plataforma = pv.id_plataforma
      WHERE cp.id_costo = $1
    `;
    const result = await pool.query(query, [id]);
    return result.rows[0] || null;
  }

  async findByProductoId(idProducto: number): Promise<any[]> {
    const query = `
      SELECT cp.*,
             ca.nombre_caja,
             cd.nombre_cadena,
             pv.nombre_plataforma
      FROM costo_producto cp
      JOIN caja ca ON cp.id_caja = ca.id_caja
      JOIN cadena cd ON cp.id_cadena = cd.id_cadena
      JOIN plataforma_venta pv ON cp.id_plataforma = pv.id_plataforma
      WHERE cp.id_producto = $1
    `;
    const result = await pool.query(query, [idProducto]);
    return result.rows;
  }

  async create(data: CreateCostoProductoDto, usuario: string): Promise<CostoProducto> {
    const query = `
      INSERT INTO costo_producto (id_producto, id_caja, id_cadena, id_plataforma, neto, iva, total, usuario)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
      RETURNING *
    `;
    const result = await pool.query(query, [
      data.id_producto,
      data.id_caja,
      data.id_cadena,
      data.id_plataforma,
      data.neto || null,
      data.iva || null,
      data.total || null,
      usuario
    ]);
    return result.rows[0];
  }

  async update(id: number, data: UpdateCostoProductoDto, usuario: string): Promise<CostoProducto | null> {
    const fields: string[] = [];
    const values: any[] = [];
    let paramIndex = 1;

    if (data.id_caja !== undefined) {
      fields.push(`id_caja = $${paramIndex++}`);
      values.push(data.id_caja);
    }
    if (data.id_cadena !== undefined) {
      fields.push(`id_cadena = $${paramIndex++}`);
      values.push(data.id_cadena);
    }
    if (data.id_plataforma !== undefined) {
      fields.push(`id_plataforma = $${paramIndex++}`);
      values.push(data.id_plataforma);
    }
    if (data.neto !== undefined) {
      fields.push(`neto = $${paramIndex++}`);
      values.push(data.neto);
    }
    if (data.iva !== undefined) {
      fields.push(`iva = $${paramIndex++}`);
      values.push(data.iva);
    }
    if (data.total !== undefined) {
      fields.push(`total = $${paramIndex++}`);
      values.push(data.total);
    }

    fields.push(`usuario = $${paramIndex++}`);
    values.push(usuario);
    values.push(id);

    const query = `
      UPDATE costo_producto 
      SET ${fields.join(', ')}
      WHERE id_costo = $${paramIndex}
      RETURNING *
    `;

    const result = await pool.query(query, values);
    return result.rows[0] || null;
  }

  async delete(id: number): Promise<boolean> {
    const query = 'DELETE FROM costo_producto WHERE id_costo = $1';
    const result = await pool.query(query, [id]);
    return (result.rowCount ?? 0) > 0;
  }

  // Insumos del costo
  async getInsumos(idCosto: number): Promise<any[]> {
    const query = `
      SELECT ic.*, i.nombre_insumo, i.precio_insumo
      FROM insumo_costo ic
      JOIN insumo i ON ic.id_insumo = i.id_insumo
      WHERE ic.id_costo = $1
    `;
    const result = await pool.query(query, [idCosto]);
    return result.rows;
  }

  async addInsumo(idCosto: number, idInsumo: number, cantidad: number, usuario: string): Promise<any> {
    const query = `
      INSERT INTO insumo_costo (id_insumo, id_costo, cantidad, usuario)
      VALUES ($1, $2, $3, $4)
      ON CONFLICT (id_insumo, id_costo)
      DO UPDATE SET cantidad = $3, usuario = $4
      RETURNING *
    `;
    const result = await pool.query(query, [idInsumo, idCosto, cantidad, usuario]);
    return result.rows[0];
  }

  async removeInsumo(idCosto: number, idInsumo: number): Promise<boolean> {
    const query = 'DELETE FROM insumo_costo WHERE id_costo = $1 AND id_insumo = $2';
    const result = await pool.query(query, [idCosto, idInsumo]);
    return (result.rowCount ?? 0) > 0;
  }
}

export default new CostoProductoService();
