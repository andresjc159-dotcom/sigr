import { MesaModel } from '../models/Mesa.js';
import { AppError } from '../middleware/errorHandler.js';

export const MesaController = {
  async getAll(req, res, next) {
    try {
      const mesas = await MesaModel.findAll();
      res.json(mesas);
    } catch (error) {
      next(error);
    }
  },

  async getById(req, res, next) {
    try {
      const { id } = req.params;
      const mesa = await MesaModel.findById(id);

      if (!mesa) {
        throw new AppError('Mesa no encontrada.', 404);
      }

      res.json(mesa);
    } catch (error) {
      next(error);
    }
  },

  async getByEstado(req, res, next) {
    try {
      const { estado } = req.query;
      const mesas = await MesaModel.findByEstado(estado);
      res.json(mesas);
    } catch (error) {
      next(error);
    }
  },

  async create(req, res, next) {
    try {
      const { numero, capacidad, ubicacion } = req.body;

      if (!numero || !capacidad) {
        throw new AppError('Número y capacidad son requeridos.', 400);
      }

      const mesa = await MesaModel.create({ numero, capacidad, ubicacion });

      res.status(201).json(mesa);
    } catch (error) {
      next(error);
    }
  },

  async update(req, res, next) {
    try {
      const { id } = req.params;
      const { numero, capacidad, ubicacion, estado, mesero_id } = req.body;

      const mesa = await MesaModel.update(id, { numero, capacidad, ubicacion, estado, mesero_id });

      if (!mesa) {
        throw new AppError('Mesa no encontrada.', 404);
      }

      res.json(mesa);
    } catch (error) {
      next(error);
    }
  },

  async assignMesero(req, res, next) {
    try {
      const { id } = req.params;
      const { mesero_id } = req.body;

      const mesa = await MesaModel.assignMesero(id, mesero_id);

      if (!mesa) {
        throw new AppError('Mesa no encontrada.', 404);
      }

      res.json(mesa);
    } catch (error) {
      next(error);
    }
  },

  async delete(req, res, next) {
    try {
      const { id } = req.params;
      const mesa = await MesaModel.delete(id);

      if (!mesa) {
        throw new AppError('Mesa no encontrada.', 404);
      }

      res.json({ message: 'Mesa eliminada correctamente.' });
    } catch (error) {
      next(error);
    }
  }
};

export default { MesaController };