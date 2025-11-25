import { Request } from 'express';

// Auth
export interface Usuario {
  id_usuario: number;
  username: string;
  password: string;
  nombre: string;
  status: 'activo' | 'inactivo';
  created_at: Date;
  updated_at: Date;
}

export interface JwtPayload {
  id_usuario: number;
  username: string;
}

export interface AuthRequest extends Request {
  user?: JwtPayload;
}

// Insumo
export interface Insumo {
  id_insumo: number;
  nombre_insumo?: string;
  id_categoria?: number;
  precio_insumo?: number;
  link_insumo?: string;
  status: 'activo' | 'inactivo';
  usuario?: string;
  created_at: Date;
  updated_at: Date;
  cantidad: number;
}

export interface CreateInsumoDto {
  nombre_insumo?: string;
  id_categoria?: number;
  precio_insumo?: number;
  link_insumo?: string;
}

export interface UpdateInsumoDto {
  nombre_insumo?: string;
  id_categoria?: number;
  precio_insumo?: number;
  link_insumo?: string;
  status?: 'activo' | 'inactivo';
}

// Producto
export interface Producto {
  id_producto: number;
  sku: string;
  nombre_producto: string;
  descripcion?: string;
  precio_venta: number;
  status: 'activo' | 'inactivo';
  usuario?: string;
  created_at: Date;
  updated_at: Date;
}

export interface CreateProductoDto {
  sku: string;
  nombre_producto: string;
  descripcion?: string;
  precio_venta: number;
}

export interface UpdateProductoDto {
  sku?: string;
  nombre_producto?: string;
  descripcion?: string;
  precio_venta?: number;
  status?: 'activo' | 'inactivo';
}

// ProductoInsumo
export interface ProductoInsumo {
  id_producto: number;
  id_insumo: number;
  cantidad: number;
  neto?: number;
  iva?: number;
  total?: number;
  usuario?: string;
  created_at: Date;
  updated_at: Date;
}

export interface CreateProductoInsumoDto {
  id_insumo: number;
  cantidad: number;
  neto?: number;
  iva?: number;
  total?: number;
}

// Stock
export interface StockInsumo {
  id_stock: number;
  id_insumo: number;
  cantidad: number;
  usuario?: string;
  created_at: Date;
  updated_at: Date;
}

export interface StockProducto {
  id_stock: number;
  id_producto: number;
  cantidad: number;
  usuario?: string;
  created_at: Date;
  updated_at: Date;
}

// Respuestas API
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
}
