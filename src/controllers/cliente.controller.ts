import { Response } from 'express';
import { AuthRequest } from '../types';
import clienteService from '../services/cliente.service';

export class ClienteController {
  async findAll(req: AuthRequest, res: Response): Promise<void> {
    try {
      const clientes = await clienteService.findAll();
      res.json({ success: true, data: clientes });
    } catch (error) {
      console.error('Error en findAll clientes:', error);
      res.status(500).json({ success: false, error: 'Error interno del servidor' });
    }
  }

  async findById(req: AuthRequest, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const cliente = await clienteService.findById(Number(id));

      if (!cliente) {
        res.status(404).json({ success: false, error: 'Cliente no encontrado' });
        return;
      }

      res.json({ success: true, data: cliente });
    } catch (error) {
      console.error('Error en findById cliente:', error);
      res.status(500).json({ success: false, error: 'Error interno del servidor' });
    }
  }

  async create(req: AuthRequest, res: Response): Promise<void> {
    try {
      const { nombre_cliente } = req.body;

      if (!nombre_cliente) {
        res.status(400).json({ success: false, error: 'Nombre del cliente es requerido' });
        return;
      }

      const existingCliente = await clienteService.findByName(nombre_cliente);
            if (existingCliente) {
              res.status(400).json({
                success: false,
                error: 'El cliente ya existe'
              });
              return;
            }

      const usuario = req.user?.username || 'system';
      const cliente = await clienteService.create({ nombre_cliente }, usuario);

      res.status(201).json({ success: true, data: cliente, message: 'Cliente creado exitosamente' });
    } catch (error) {
      console.error('Error en create cliente:', error);
      res.status(500).json({ success: false, error: 'Error interno del servidor' });
    }
  }

  async update(req: AuthRequest, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const usuario = req.user?.username || 'system';
      const cliente = await clienteService.update(Number(id), req.body, usuario);

      if (!cliente) {
        res.status(404).json({ success: false, error: 'Cliente no encontrado' });
        return;
      }

      res.json({ success: true, data: cliente, message: 'Cliente actualizado exitosamente' });
    } catch (error) {
      console.error('Error en update cliente:', error);
      res.status(500).json({ success: false, error: 'Error interno del servidor' });
    }
  }
}

export default new ClienteController();
