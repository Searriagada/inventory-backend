import pool from '../config/database';
import { Producto, CreateProductoDto, UpdateProductoDto, CreateProductoInsumoDto, Insumo, ProductoInsumo } from '../types';

export class ProductoService {
  async findAll(page: number = 1, limit: number = 50, search?: string, tipoProducto?: number): Promise<{
    items: Producto[];
    total: number;
    pages: number;
    page: number;
  }> {
    const offset = (page - 1) * limit;

    // Contar total
    let countQuery = "SELECT COUNT(*) as total FROM find_all_cost_product WHERE status = 'activo'";
    const countParams: any[] = [];
    let countParamIndex = 1;

    if (search) {
      countQuery += ` AND nombre_producto ILIKE $${countParamIndex++}`;
      countParams.push(`%${search}%`);
    }
    if (tipoProducto) {
      countQuery += ` AND id_tipo = $${countParamIndex++}`;
      countParams.push(tipoProducto);
    }

    const countResult = await pool.query(countQuery, countParams);
    const total = parseInt(countResult.rows[0].total);

    // Obtener datos paginados
    let dataQuery = "SELECT * FROM find_all_cost_product WHERE status = 'activo'";
    const dataParams: any[] = [];
    let paramIndex = 1;
    console.log('Query ejecutada:', dataQuery, 'con parámetros:', dataParams);
    if (search) {
      dataQuery += ` AND nombre_producto ILIKE $${paramIndex++}`;
      dataParams.push(`%${search}%`);
    }
    if (tipoProducto) {
      dataQuery += ` AND id_tipo = $${paramIndex++}`;
      dataParams.push(tipoProducto);
    }

    dataQuery += ` ORDER BY nombre_producto ASC LIMIT $${paramIndex++} OFFSET $${paramIndex++}`;
    dataParams.push(limit, offset);

    const result = await pool.query(dataQuery, dataParams);

    return {
      items: result.rows,
      total,
      page,
      pages: Math.ceil(total / limit),
    };
  }

  async findById(id: number): Promise<Producto | null> {
    const query = 'SELECT * FROM producto WHERE id_producto = $1';
    const result = await pool.query(query, [id]);
    return result.rows[0] || null;
  }

  async findBySku(sku: string): Promise<Producto | null> {
    const query = 'SELECT * FROM producto WHERE sku = $1';
    const result = await pool.query(query, [sku]);
    return result.rows[0] || null;
  }

  async create(data: CreateProductoDto, usuario: string): Promise<Producto> {
    const client = await pool.connect();

    try {
      await client.query('BEGIN');

      // 1. Crear el producto
      const productoQuery = `
      INSERT INTO producto (sku, nombre_producto, descripcion, precio_venta, usuario)
      VALUES ($1, $2, $3, $4, $5)
      RETURNING *
    `;
      const productoResult = await client.query(productoQuery, [
        data.sku,
        data.nombre_producto,
        data.descripcion || null,
        data.precio_venta,
        usuario
      ]);
      const producto = productoResult.rows[0];

      // 2. Insertar los insumos asociados
      if (data.insumos && data.insumos.length > 0) {
        const insumosQuery = `
        INSERT INTO producto_insumo (id_producto, id_insumo, cantidad, usuario)
        VALUES ($1, $2, $3, $4)
      `;

        for (const insumo of data.insumos) {
          await client.query(insumosQuery, [producto.id_producto, insumo.id_insumo, insumo.cantidad, usuario]);
        }
      }

      await client.query('COMMIT');
      return producto;
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  }

  async update(id: number, data: UpdateProductoDto, usuario: string): Promise<Producto | null> {
    const client = await pool.connect();

    try {
      await client.query('BEGIN');

      // 1. Actualizar datos básicos del producto
      const fields: string[] = [];
      const values: any[] = [];
      let paramIndex = 1;

      if (data.sku !== undefined) {
        fields.push(`sku = $${paramIndex++}`);
        values.push(data.sku);
      }
      if (data.nombre_producto !== undefined) {
        fields.push(`nombre_producto = $${paramIndex++}`);
        values.push(data.nombre_producto);
      }
      if (data.descripcion !== undefined) {
        fields.push(`descripcion = $${paramIndex++}`);
        values.push(data.descripcion);
      }
      if (data.precio_venta !== undefined) {
        fields.push(`precio_venta = $${paramIndex++}`);
        values.push(data.precio_venta);
      }
      if (data.status !== undefined) {
        fields.push(`status = $${paramIndex++}`);
        values.push(data.status);
      }

      fields.push(`usuario = $${paramIndex++}`);
      values.push(usuario);
      values.push(id);

      const query = `
      UPDATE producto 
      SET ${fields.join(', ')}
      WHERE id_producto = $${paramIndex}
      RETURNING *
    `;

      const result = await client.query(query, values);
      const producto = result.rows[0];

      if (!producto) {
        await client.query('ROLLBACK');
        return null;
      }

      // 2. Actualizar insumos (si se enviaron)
      if (data.insumos !== undefined) {
        // Eliminar insumos existentes
        await client.query('DELETE FROM producto_insumo WHERE id_producto = $1', [id]);

        // Insertar nuevos insumos
        if (data.insumos.length > 0) {
          const insumosQuery = `
          INSERT INTO producto_insumo (id_producto, id_insumo, cantidad, usuario)
          VALUES ($1, $2, $3, $4)
        `;

          for (const insumo of data.insumos) {
            await client.query(insumosQuery, [id, insumo.id_insumo, insumo.cantidad, usuario]);
          }
        }
      }

      await client.query('COMMIT');
      return producto;
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  }

  // Insumos del producto
  async getInsumos(idProducto: number): Promise<any[]> {
    const query =
      `SELECT 
        p.sku,
        P.nombre_producto,
        i.id_insumo, 
        i.nombre_insumo, 
        i.id_categoria, 
        i.precio_insumo, 
        i.link_insumo, 
        i.status,
        pi.cantidad
    from producto p 
    INNER JOIN producto_insumo pi ON p.id_producto = pi.id_producto
    LEFT JOIN insumo i ON pi.id_insumo = i.id_insumo
      WHERE pi.id_producto = $1
    `;
    const result = await pool.query(query, [idProducto]);
    return result.rows;
  }

async addInsumos(
  idProducto: number,
  insumos: { id_insumo: number; cantidad: number }[],
  usuario: string
): Promise<any> {
  const client = await pool.connect();
  
  try {
    await client.query('BEGIN');

    // 1. Eliminar insumos existentes
    await client.query(
      'DELETE FROM producto_insumo WHERE id_producto = $1',
      [idProducto]
    );

    // 2. Insertar nuevos insumos
    const resultados = [];
    if (insumos.length > 0) {
      for (const insumo of insumos) {
        const result = await client.query(
          `INSERT INTO producto_insumo (id_producto, id_insumo, cantidad, usuario)
           VALUES ($1, $2, $3, $4)
           RETURNING *`,
          [idProducto, insumo.id_insumo, insumo.cantidad, usuario]
        );
        resultados.push(result.rows[0]);
      }
    }

    await client.query('COMMIT');
    return resultados;
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally {
    client.release();
  }
}

  async removeInsumo(idProducto: number, idInsumo: number): Promise<boolean> {
    const query = `
      DELETE FROM producto_insumo 
      WHERE id_producto = $1 AND id_insumo = $2
    `;
    const result = await pool.query(query, [idProducto, idInsumo]);
    return (result.rowCount ?? 0) > 0;
  }

  async togglePublicadoML(id: number, usuario: string): Promise<Producto | null> {
    const query = `
      UPDATE producto 
      SET publicado_ml = CASE 
        WHEN publicado_ml = 'si' THEN 'no'
        WHEN publicado_ml = 'no' THEN 'si'
        ELSE 'no'
      END,
      usuario = $2
      WHERE id_producto = $1
      RETURNING *
    `;

    const result = await pool.query(query, [id, usuario]);
    return result.rows[0] || null;
  }

  async updatePublicadoML(id: number, publicado_ml: 'si' | 'no', usuario: string): Promise<Producto | null> {
    const query = `
      UPDATE producto 
      SET publicado_ml = $2,
      usuario = $3
      WHERE id_producto = $1
      RETURNING *
    `;

    const result = await pool.query(query, [id, publicado_ml, usuario]);
    return result.rows[0] || null;
  }

}



export default new ProductoService();
