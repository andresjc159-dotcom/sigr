import { ReservaModel } from '../models/Reserva.js';
import { AppError } from '../middleware/errorHandler.js';

export const ReservaController = {
  async getAll(req, res, next) {
    try {
      const { estado, fecha } = req.query;
      const reservas = await ReservaModel.findAll({ estado, fecha });
      res.json(reservas);
    } catch (error) {
      next(error);
    }
  },

  async getById(req, res, next) {
    try {
      const { id } = req.params;
      const reserva = await ReservaModel.findById(id);

      if (!reserva) {
        throw new AppError('Reserva no encontrada.', 404);
      }

      res.json(reserva);
    } catch (error) {
      next(error);
    }
  },

  async create(req, res, next) {
    try {
      const {
        mesa_id,
        fecha_reserva,
        hora_inicio,
        num_personas,
        nota_especial,
        nombre_contacto,
        telefono,
        email_contacto
      } = req.body;

      if (!fecha_reserva || !hora_inicio || !num_personas) {
        throw new AppError('Fecha, hora y número de personas son requeridos.', 400);
      }

      if (!nombre_contacto || !telefono) {
        throw new AppError('Nombre y teléfono de contacto son requeridos.', 400);
      }

      const disponibilidad = await ReservaModel.getAvailability(
        fecha_reserva,
        hora_inicio,
        num_personas
      );

      let mesaAsignada = mesa_id;
      if (!mesaAsignada && disponibilidad.length > 0) {
        mesaAsignada = disponibilidad[0].id;
      }

      const reservaData = {
        cliente_id: req.user?.id || null,
        mesa_id: mesaAsignada,
        nombre_contacto,
        telefono,
        email_contacto,
        fecha_reserva,
        hora_inicio,
        num_personas,
        nota_especial,
        gestionado_por: req.user?.id || null
      };

      const reserva = await ReservaModel.create(reservaData);

      res.status(201).json(reserva);
    } catch (error) {
      next(error);
    }
  },

  async update(req, res, next) {
    try {
      const { id } = req.params;
      const { estado, nota_interna, mesa_id } = req.body;

      const reserva = await ReservaModel.update(id, { estado, nota_interna, mesa_id });

      if (!reserva) {
        throw new AppError('Reserva no encontrada.', 404);
      }

      res.json(reserva);
    } catch (error) {
      next(error);
    }
  },

  async getAvailability(req, res, next) {
    try {
      const { fecha, hora, personas } = req.query;

      if (!fecha || !hora || !personas) {
        throw new AppError('Fecha, hora y número de personas son requeridos.', 400);
      }

      const disponibilidad = await ReservaModel.getAvailability(
        fecha,
        hora,
        parseInt(personas)
      );

      res.json(disponibilidad);
    } catch (error) {
      next(error);
    }
  },

  async getByFecha(req, res, next) {
    try {
      const { fecha } = req.query;
      const reservas = await ReservaModel.findByFecha(fecha);
      res.json(reservas);
    } catch (error) {
      next(error);
    }
  }
};

export default { ReservaController };