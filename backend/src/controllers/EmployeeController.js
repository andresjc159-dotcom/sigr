import { UserModel } from '../models/User.js';
import { AppError } from '../middleware/errorHandler.js';

export const EmployeeController = {
  async getAll(req, res, next) {
    try {
      const { rol, estado } = req.query;
      const employees = await UserModel.findAll({ rol, estado, excludeCliente: true });

      res.json(employees);
    } catch (error) {
      next(error);
    }
  },

  async getById(req, res, next) {
    try {
      const { id } = req.params;
      const employee = await UserModel.findById(id);

      if (!employee) {
        throw new AppError('Empleado no encontrado.', 404);
      }

      res.json(employee);
    } catch (error) {
      next(error);
    }
  },

  async create(req, res, next) {
    try {
      const { nombre, apellido, email, telefono, password, rol } = req.body;

      if (!nombre || !apellido || !email || !password || !rol) {
        throw new AppError('Nombre, apellido, email, password y rol son requeridos.', 400);
      }

      const existingUser = await UserModel.findByEmail(email);
      if (existingUser) {
        throw new AppError('El email ya está registrado.', 400);
      }

      const employee = await UserModel.create({
        nombre,
        apellido,
        email,
        telefono,
        password,
        rol,
        creado_por: req.user.id
      });

      res.status(201).json(employee);
    } catch (error) {
      next(error);
    }
  },

  async update(req, res, next) {
    try {
      const { id } = req.params;
      const { nombre, apellido, telefono, rol, estado } = req.body;

      const employee = await UserModel.update(id, {
        nombre,
        apellido,
        telefono,
        rol,
        estado
      });

      if (!employee) {
        throw new AppError('Empleado no encontrado.', 404);
      }

      res.json(employee);
    } catch (error) {
      next(error);
    }
  },

  async toggleStatus(req, res, next) {
    try {
      const { id } = req.params;

      const employee = await UserModel.toggleStatus(id);

      if (!employee) {
        throw new AppError('Empleado no encontrado.', 404);
      }

      res.json(employee);
    } catch (error) {
      next(error);
    }
  }
};

export default { EmployeeController };