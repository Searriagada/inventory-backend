import { Request, Response } from 'express';
import authService from '../services/auth.service';

export class AuthController {
  async register(req: Request, res: Response): Promise<void> {
    try {
      const { username, password, nombre } = req.body;

      if (!username || !password || !nombre) {
        res.status(400).json({
          success: false,
          error: 'Username, password y nombre son requeridos'
        });
        return;
      }

      const existingUser = await authService.findByUsername(username);
      if (existingUser) {
        res.status(400).json({
          success: false,
          error: 'El username ya está registrado'
        });
        return;
      }

      const user = await authService.register(username, password, nombre);

      res.status(201).json({
        success: true,
        data: user,
        message: 'Usuario registrado exitosamente'
      });
    } catch (error) {
      console.error('Error en register:', error);
      res.status(500).json({
        success: false,
        error: 'Error interno del servidor'
      });
    }
  }

  async login(req: Request, res: Response): Promise<void> {
    try {
      const { username, password } = req.body;

      if (!username || !password) {
        res.status(400).json({
          success: false,
          error: 'Username y password son requeridos'
        });
        return;
      }

      const result = await authService.login(username, password);

      if (!result) {
        res.status(401).json({
          success: false,
          error: 'Credenciales inválidas'
        });
        return;
      }

      res.json({
        success: true,
        data: result,
        message: 'Login exitoso'
      });
    } catch (error) {
      console.error('Error en login:', error);
      res.status(500).json({
        success: false,
        error: 'Error interno del servidor'
      });
    }
  }
}

export default new AuthController();
