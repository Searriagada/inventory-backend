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
    let countQuery = `SELECT COUNT(*) as total FROM producto
          WHERE status = 'activo'`;
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
    let dataQuery = `WITH costos_cadena AS (
                    -- Calcular el costo cadena
                    SELECT 
                        cc.id_cadena, 
                        SUM(i.precio_insumo * cc.cantidad) AS total
                    FROM costo_cadena cc
                    INNER JOIN insumo i ON cc.id_insumo = i.id_insumo
                    GROUP BY cc.id_cadena
                ),
                costos_insumos_mixtos AS (
                    -- Calculamos joya y empaque
                    SELECT 
                        pi.id_producto, 
                        -- Si no es empaque, suma al costo de joya
                        SUM(CASE 
                            WHEN ci.nombre_categoria NOT LIKE '%EMPAQUE%' THEN pi.cantidad * i.precio_insumo 
                            ELSE 0 
                        END) AS costo_materiales,
                        -- Si es empaque, suma al costo de embalaje
                        SUM(CASE 
                            WHEN ci.nombre_categoria LIKE '%EMPAQUE%' THEN pi.cantidad * i.precio_insumo 
                            ELSE 0 
                        END) AS costo_embalaje
                    FROM producto_insumo pi
                    INNER JOIN insumo i ON pi.id_insumo = i.id_insumo
                    LEFT JOIN categoria_insumo ci ON i.id_categoria = ci.id_categoria
                    GROUP BY pi.id_producto
                )
                SELECT 
                    p.id_producto,
                    p.sku,
                    p.nombre_producto,
                    tp.id_tipo,
                    tp.nombre_tipo_producto,
                    p.utilidad,
                    p.id_cadena,
                    p.costo_fijo,
                    sp.cantidad AS stock_actual,
                    -- Cálculos finales limpios
                    COALESCE(cc.total, 0) AS valor_cadena,
                    (COALESCE(cc.total, 0) + COALESCE(cim.costo_materiales, 0) + COALESCE(p.costo_fijo, 0)) AS joya,
                    COALESCE(cim.costo_embalaje, 0) AS costo_embalaje,
                    (COALESCE(cc.total, 0) + COALESCE(cim.costo_materiales, 0) + COALESCE(p.costo_fijo, 0) + COALESCE(cim.costo_embalaje, 0)) AS costo_total,
                    p.precio_venta,
                    p.publicado_ml,
                    p.descripcion,
                    p.status
                FROM producto p
                LEFT JOIN stock_producto sp ON p.id_producto = sp.id_producto
                LEFT JOIN tipo_producto tp ON p.id_tipo = tp.id_tipo
                LEFT JOIN costos_cadena cc ON p.id_cadena = cc.id_cadena
                LEFT JOIN costos_insumos_mixtos cim ON p.id_producto = cim.id_producto
                WHERE p.status = 'activo'`;
    const dataParams: any[] = [];
    let paramIndex = 1;
    if (search) {
      dataQuery += ` AND nombre_producto ILIKE $${paramIndex++}`;
      dataParams.push(`%${search}%`);
    }
    if (tipoProducto) {
      dataQuery += ` AND tp.id_tipo = $${paramIndex++}`;
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

      // Crear el producto
      const productoQuery = `
      INSERT INTO producto (sku, nombre_producto, descripcion, id_tipo, utilidad, usuario, plataforma_venta, costo_fijo)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
      RETURNING *
    `;
    // Un pequeño helper para convertir a mayúsculas o null los string
      const toUpper = (val?: string) => val?.toUpperCase() || null;
      
      const productoResult = await client.query(productoQuery, [
        toUpper(data.sku),
        toUpper(data.nombre_producto),
        toUpper(data.descripcion),
        data.id_tipo_producto,
        data.utilidad || null,
        usuario,
        1,
        data.costo_fijo || null
      ]);
      const producto = productoResult.rows[0];

      // Crear registro en stock_producto
      const stockQuery = `
      INSERT INTO stock_producto (id_producto, cantidad, usuario)
      VALUES ($1, $2, $3)
      RETURNING *
    `;
      await client.query(stockQuery, [
        producto.id_producto,
        data.cantidad || 0,
        usuario
      ]);

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

      // Actualizar datos básicos del producto
      const fields: string[] = [];
      const values: any[] = [];
      let paramIndex = 1;

      if (data.sku !== undefined) {
        fields.push(`sku = $${paramIndex++}`);
        values.push(data.sku.toUpperCase());
      }
      if (data.nombre_producto !== undefined) {
        fields.push(`nombre_producto = $${paramIndex++}`);
        values.push(data.nombre_producto.toUpperCase());
      }
      if (data.descripcion !== undefined) {
        fields.push(`descripcion = $${paramIndex++}`);
        values.push(data.descripcion.toUpperCase());
      }
      if (data.precio_venta !== undefined) {
        fields.push(`precio_venta = $${paramIndex++}`);
        values.push(data.precio_venta);
      }
      if (data.status !== undefined) {
        fields.push(`status = $${paramIndex++}`);
        values.push(data.status);
      }
      if (data.utilidad !== undefined) {
        fields.push(`utilidad = $${paramIndex++}`);
        values.push(data.utilidad);
      }
      if (data.costo_fijo !== undefined) {
        fields.push(`costo_fijo = $${paramIndex++}`);
        values.push(data.costo_fijo);
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
  async getInsumosFabricacion(idProducto: number): Promise<any> {
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
    LEFT JOIN categoria_insumo ci ON i.id_categoria = ci.id_categoria
    WHERE pi.id_producto = $1 AND ci.nombre_categoria NOT LIKE 'EMPAQUE'
    `;
    const result = await pool.query(query, [idProducto]);

    if (result.rowCount === 0) {
      return [];
    }

    //Enviar datos filtrados
    const listaInsumos = result.rows.map(row => ({
      id_insumo: row.id_insumo,
      nombre_insumo: row.nombre_insumo,
      id_categoria: row.id_categoria,
      precio_insumo: row.precio_insumo,
      status: row.status,
      cantidad: row.cantidad,
      subtotal: row.precio_insumo * row.cantidad,
      categoria_insumo: row.nombre_categoria
    }));
    return listaInsumos;
  }

  async getInsumosEmbalaje(idProducto: number): Promise<any> {
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
    LEFT JOIN categoria_insumo ci ON i.id_categoria = ci.id_categoria
    WHERE pi.id_producto = $1 AND ci.nombre_categoria LIKE 'EMPAQUE'
    `;
    const result = await pool.query(query, [idProducto]);

    if (result.rowCount === 0) {
      return [];
    }

    //Enviar datos filtrados
    const listaInsumos = result.rows.map(row => ({
      id_insumo: row.id_insumo,
      nombre_insumo: row.nombre_insumo,
      id_categoria: row.id_categoria,
      precio_insumo: row.precio_insumo,
      status: row.status,
      cantidad: row.cantidad,
      subtotal: row.precio_insumo * row.cantidad,
      categoria_insumo: row.nombre_categoria
    }));
    return listaInsumos;
  }

  async addInsumos(
    idProducto: number,
    insumos: { id_insumo: number; cantidad: number }[],
    idCadena: number | null,
    usuario: string
  ): Promise<any> {
    const client = await pool.connect();

    try {
      await client.query('BEGIN');

      await client.query(
        'UPDATE producto SET id_cadena = $1, usuario = $2 WHERE id_producto = $3',
        [idCadena, usuario, idProducto]
      );

      await client.query(
        `DELETE FROM producto_insumo 
             WHERE id_producto = $1 AND id_insumo IN(
                SELECT i.id_insumo FROM insumo i
                INNER JOIN categoria_insumo ci ON i.id_categoria = ci.id_categoria
                WHERE ci.nombre_categoria NOT LIKE 'EMPAQUE'
             )`,
        [idProducto]
      );

      const insertPromises = insumos.map(insumo => {
        return client.query(
          `INSERT INTO producto_insumo (id_producto, id_insumo, cantidad, usuario)
                 VALUES ($1, $2, $3, $4)
                 ON CONFLICT (id_producto, id_insumo) 
                 DO UPDATE SET cantidad = EXCLUDED.cantidad, usuario = EXCLUDED.usuario
                 RETURNING *`,
          [idProducto, insumo.id_insumo, insumo.cantidad, usuario]
        );
      });

      const resultadosQuery = await Promise.all(insertPromises);
      const resultados = resultadosQuery.map(r => r.rows[0]);

      await client.query('COMMIT');
      return resultados;

    } catch (error) {
      await client.query('ROLLBACK');
      console.error('Error en transacción:', error);
      throw error;
    } finally {
      client.release();
    }
  }

  async addEmbalaje(
    idProducto: number,
    insumos: { id_insumo: number; cantidad: number }[],
    usuario: string
  ): Promise<any> {
    const client = await pool.connect();

    try {
      await client.query('BEGIN');

      await client.query(
        `DELETE FROM producto_insumo 
             WHERE id_producto = $1 AND id_insumo IN (
                SELECT i.id_insumo FROM insumo i
                INNER JOIN categoria_insumo ci ON i.id_categoria = ci.id_categoria
                WHERE ci.nombre_categoria LIKE 'EMPAQUE'
             )`,
        [idProducto]
      );

      const insertPromises = insumos.map(insumo => {
        return client.query(
          `INSERT INTO producto_insumo (id_producto, id_insumo, cantidad, usuario)
                 VALUES ($1, $2, $3, $4)
                 ON CONFLICT (id_producto, id_insumo) 
                 DO UPDATE SET cantidad = EXCLUDED.cantidad, usuario = EXCLUDED.usuario
                 RETURNING *`,
          [idProducto, insumo.id_insumo, insumo.cantidad, usuario]
        );
      });

      const resultadosQuery = await Promise.all(insertPromises);
      const resultados = resultadosQuery.map(r => r.rows[0]);

      await client.query('COMMIT');
      return resultados;
    } catch (error) {
      await client.query('ROLLBACK');
      console.error('Error en addEmbalaje:', error);
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


  // Costos y valor de venta
  async getCostoVenta(idProducto: number): Promise<any> {
    const query =
      `
      WITH costos_cadena AS (
                    -- Calcular el costo cadena
                    SELECT 
                        cc.id_cadena, 
                        SUM(i.precio_insumo * cc.cantidad) AS total
                    FROM costo_cadena cc
                    INNER JOIN insumo i ON cc.id_insumo = i.id_insumo
                    GROUP BY cc.id_cadena
                ),
                costos_insumos_mixtos AS (
                    -- Calculamos joya y empaque
                    SELECT 
                        pi.id_producto, 
                        -- Si no es empaque, suma al costo de joya
                        SUM(CASE 
                            WHEN ci.nombre_categoria NOT LIKE '%EMPAQUE%' THEN pi.cantidad * i.precio_insumo 
                            ELSE 0 
                        END) AS costo_materiales,
                        -- Si es empaque, suma al costo de embalaje
                        SUM(CASE 
                            WHEN ci.nombre_categoria LIKE '%EMPAQUE%' THEN pi.cantidad * i.precio_insumo 
                            ELSE 0 
                        END) AS costo_embalaje
                    FROM producto_insumo pi
                    INNER JOIN insumo i ON pi.id_insumo = i.id_insumo
                    LEFT JOIN categoria_insumo ci ON i.id_categoria = ci.id_categoria
                    GROUP BY pi.id_producto
                )
                SELECT 
                    p.id_producto,
                    p.nombre_producto,
					          p.utilidad,
                    pv.costo_despacho,
                    pv.comision,
                    pv.monto_envio_gratis,
                    -- Cálculos finales limpios
                    (COALESCE(cc.total, 0) + COALESCE(cim.costo_materiales, 0)) AS joya,
					          COALESCE(cim.costo_embalaje, 0) AS costo_embalaje,
                    (COALESCE(cc.total, 0) + COALESCE(cim.costo_materiales, 0) + COALESCE(cim.costo_embalaje, 0)) AS costo_total,
                    p.precio_venta
                FROM producto p
                LEFT JOIN stock_producto sp ON p.id_producto = sp.id_producto
                LEFT JOIN tipo_producto tp ON p.id_tipo = tp.id_tipo
                LEFT JOIN costos_cadena cc ON p.id_cadena = cc.id_cadena
                LEFT JOIN costos_insumos_mixtos cim ON p.id_producto = cim.id_producto
				        LEFT JOIN plataforma_venta pv ON p.plataforma_venta = pv.id_plataforma
                WHERE p.id_producto = $1
    `;
    const result = await pool.query(query, [idProducto]);

    if (result.rowCount === 0) {
      return [];
    }
    let despacho = Number(result.rows[0].costo_despacho || 0);
    let comision = Number(result.rows[0].comision || 0);
    let montoEnvioGratis = Number(result.rows[0].monto_envio_gratis || 0);
    let costoTotal = Number(result.rows[0].costo_total || 0);
    let utilidad = Number(result.rows[0].utilidad || 0);
    let valorUtilidad = (utilidad * costoTotal);
    let variableCostos = (1 / 1.19) - comision;
    let precioVenta = Number(result.rows[0].precio_venta || 0);
    let precioVentaEstimado = 0;
    let preCalculoVenta = ((costoTotal + (costoTotal * utilidad)) / variableCostos);
    if (preCalculoVenta < montoEnvioGratis) {
      precioVentaEstimado = preCalculoVenta;
    } else { precioVentaEstimado = ((costoTotal + (costoTotal * utilidad)) + despacho) / variableCostos; }
    let neto = precioVenta / 1.19;
    let iva = precioVenta - neto;

    //Enviar datos filtrados
    const listaInsumos = result.rows.map(row => ({
      id_producto: row.id_producto,
      nombre_producto: row.nombre_producto,
      utilidad: valorUtilidad,
      despacho: row.costo_despacho,
      comision: row.comision,
      monto_envio_gratis: row.monto_envio_gratis,
      joya: row.joya,
      costo_embalaje: row.costo_embalaje,
      costo_total: row.costo_total,
      precio_venta: row.precio_venta,
      precio_venta_estimado: precioVentaEstimado,
      neto: neto,
      iva: iva
    }));
    console.log("Id", result.rows[0].id_producto, "Despacho:", despacho, "Comisión:", comision, "Monto Envío Gratis:", montoEnvioGratis, "Costo Total:", costoTotal, "Utilidad:", utilidad, "Valor Utilidad:", valorUtilidad, "Precio Venta Estimado:", precioVentaEstimado, "Neto:", neto, "IVA:", iva);
    return listaInsumos;
  }

  async updateStockProducto(idProducto: number, cantidadMovimiento: number, nota: string, usuario: string): Promise<boolean> {
  const client = await pool.connect();

  try {
    await client.query('BEGIN');

    // Obtener el stock actual
    const stockActualQuery = `
      SELECT cantidad FROM stock_producto 
      WHERE id_producto = $1
    `;
    const stockResult = await client.query(stockActualQuery, [idProducto]);
    
    if (stockResult.rows.length === 0) {
      await client.query('ROLLBACK');
      throw new Error('Producto no encontrado');
    }

    const cantidadActual = stockResult.rows[0].cantidad;
    const cantidadNueva = cantidadActual + cantidadMovimiento;

    // Validar que no quede en negativo
    if (cantidadNueva < 0) {
      await client.query('ROLLBACK');
      throw new Error(`No se pudo llevar a cabo debido a stock insuficiente: ${cantidadActual}`);
    }

    const tipoTransaccion = cantidadMovimiento > 0 ? 'nuevo_stock' : 'retiro';

    // Actualizar stock
    const updateQuery = `
      UPDATE stock_producto 
      SET cantidad = $1, usuario = $2
      WHERE id_producto = $3
    `;
    await client.query(updateQuery, [cantidadNueva, usuario, idProducto]);

    // Insertar en stock_movement_producto
    const movementQuery = `
      INSERT INTO stock_movement_producto (id_producto, tipo_transaccion, nota, usuario)
      VALUES ($1, $2, $3, $4)
    `;
    await client.query(movementQuery, [idProducto, tipoTransaccion, nota, usuario]);

    await client.query('COMMIT');
    return true;
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally {
    client.release();
  }
}
}




export default new ProductoService();