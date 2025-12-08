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
export interface CadenaInsumoDto {
  id_insumo: number;
  cantidad: number;
}
export interface CreateCadenaDto {
  nombre_cadena: string;
  insumos?: CadenaInsumoDto[];
}

export interface UpdateCadenaDto {
  nombre_cadena?: string;
  precio?: number;
  status?: 'activo' | 'inactivo';
  insumos?: CadenaInsumoDto[];
}


export class CadenaService {
  async findAll(status?: string): Promise<Cadena[]> {
    let query = `select 
                c.id_cadena, 
                c.nombre_cadena, 
                sum(i.precio_insumo * cd.cantidad) as precio,
                c.status,c.usuario, 
                c.created_at, 
                c.updated_at 
                from cadena c
                  left join costo_cadena cd on c.id_cadena = cd.id_cadena
                  left join insumo i on cd.id_insumo = i.id_insumo
                group by c.id_cadena, 
                c.nombre_cadena, 
                c.status,c.usuario, 
                c.created_at, 
                c.updated_at `;
    const params: string[] = [];

    if (status) {
      query += ' WHERE status = $1';
      params.push(status);
    }

    query += ' ORDER BY nombre_cadena ASC';

    const result = await pool.query(query, params);
    return result.rows;
  }

  async findById(id: number): Promise<Cadena[]> {
    const query = `select 
                  c.id_cadena, 
                  c.nombre_cadena,
                  cd.id_insumo,
                  i.nombre_insumo,
                  i.precio_insumo,
                  cd.cantidad,
                  sum(i.precio_insumo * cd.cantidad) as total,
                  c.status,c.usuario, 
                  c.created_at, 
                  c.updated_at 
                  from cadena c
                    left join costo_cadena cd on c.id_cadena = cd.id_cadena
                    left join insumo i on cd.id_insumo = i.id_insumo
                  where c.id_cadena = $1
                  group by c.id_cadena, 
                  c.nombre_cadena, 
                  cd.id_insumo,
                  i.nombre_insumo,
                  i.precio_insumo,
                  cd.cantidad,
                  c.status,c.usuario, 
                  c.created_at, 
                  c.updated_at`;
    const result = await pool.query(query, [id]);
    return result.rows;
  }

  async create(data: CreateCadenaDto, usuario: string): Promise<Cadena> {
  const client = await pool.connect();
  
  try {
    await client.query('BEGIN');
    
    // 1. Crear la cadena
    const cadenaQuery = `
      INSERT INTO cadena (nombre_cadena, usuario)
      VALUES ($1, $2)
      RETURNING *
    `;
    const cadenaResult = await client.query(cadenaQuery, [data.nombre_cadena, usuario]);
    const cadena = cadenaResult.rows[0];
    
    // 2. Insertar los insumos asociados
    if (data.insumos && data.insumos.length > 0) {
      const insumosQuery = `
        INSERT INTO costo_cadena (id_cadena, id_insumo, cantidad, usuario)
        VALUES ($1, $2, $3, $4)
      `;
      
      for (const insumo of data.insumos) {
        await client.query(insumosQuery, [cadena.id_cadena, insumo.id_insumo, insumo.cantidad, usuario]);
      }
    }
    
    await client.query('COMMIT');
    return cadena;
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally {
    client.release();
  }
}

  async update(id: number, data: UpdateCadenaDto, usuario: string): Promise<Cadena | null> {
  const client = await pool.connect();
  
  try {
    await client.query('BEGIN');
    
    // 1. Actualizar datos básicos de la cadena
    const fields: string[] = [];
    const values: any[] = [];
    let paramIndex = 1;

    if (data.nombre_cadena !== undefined) {
      fields.push(`nombre_cadena = $${paramIndex++}`);
      values.push(data.nombre_cadena);
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

    const result = await client.query(query, values);
    const cadena = result.rows[0];
    
    if (!cadena) {
      await client.query('ROLLBACK');
      return null;
    }
    
    // 2. Actualizar insumos (si se enviaron)
    if (data.insumos !== undefined) {
      // Eliminar insumos existentes
      await client.query('DELETE FROM costo_cadena WHERE id_cadena = $1', [id]);
      
      // Insertar nuevos insumos
      if (data.insumos.length > 0) {
        const insumosQuery = `
          INSERT INTO costo_cadena (id_cadena, id_insumo, cantidad, usuario)
          VALUES ($1, $2, $3, $4)
        `;
        
        for (const insumo of data.insumos) {
          await client.query(insumosQuery, [id, insumo.id_insumo, insumo.cantidad, usuario]);
        }
      }
    }
    
    await client.query('COMMIT');
    return cadena;
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally {
    client.release();
  }
}

  async delete(id: number): Promise<boolean> {
    const query = `UPDATE cadena SET status = 'inactivo' WHERE id_cadena = $1`;
    const result = await pool.query(query, [id]);
    return (result.rowCount ?? 0) > 0;
  }
}

export default new CadenaService();
