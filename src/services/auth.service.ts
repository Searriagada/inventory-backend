import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import pool from '../config/database';
import { Usuario, JwtPayload } from '../types';

export class AuthService {
  async register(
    username: string,
    password: string,
    nombre: string
  ): Promise<Omit<Usuario, 'password'>> {
    const hashedPassword = await bcrypt.hash(password, 10);

    const query = `
      INSERT INTO usuario (username, password, nombre)
      VALUES ($1, $2, $3)
      RETURNING id_usuario, username, nombre, status, created_at, updated_at
    `;

    const result = await pool.query(query, [username, hashedPassword, nombre]);
    return result.rows[0];
  }

  async login(
    username: string,
    password: string
  ): Promise<{ user: Omit<Usuario, 'password'>; token: string } | null> {
    const query = `
      SELECT * FROM usuario 
      WHERE username = $1 AND status = 'activo'
    `;

    const result = await pool.query(query, [username]);

    if (result.rows.length === 0) {
      return null;
    }

    const user = result.rows[0] as Usuario;
    const isValidPassword = await bcrypt.compare(password, user.password);

    if (!isValidPassword) {
      return null;
    }

    const payload: JwtPayload = {
      id_usuario: user.id_usuario,
      username: user.username
    };

    const token = jwt.sign(payload, process.env.JWT_SECRET || 'default_secret', {
      expiresIn: process.env.JWT_EXPIRES_IN || '24h'
    });

    const { password: _, ...userWithoutPassword } = user;

    return {
      user: userWithoutPassword,
      token
    };
  }

  async findByUsername(username: string): Promise<Usuario | null> {
    const query = `SELECT * FROM usuario WHERE username = $1`;
    const result = await pool.query(query, [username]);
    return result.rows[0] || null;
  }
}

export default new AuthService();
