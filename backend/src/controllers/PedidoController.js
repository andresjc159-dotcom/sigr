import { PedidoModel } from '../models/Pedido.js';
import { AppError } from '../middleware/errorHandler.js';

export const PedidoController = {
  async getAll(req, res, next) {
    try {
      const { estado, tipo, fecha } = req.query;
      const pedidos = await PedidoModel.findAll({ estado, tipo, fecha, mesero_id: req.user.id });
      res.json(pedidos);
    } catch (error) {
      next(error);
    }
  },

  async getById(req, res, next) {
    try {
      const { id } = req.params;
      const pedido = await PedidoModel.findById(id);

      if (!pedido) {
        throw new AppError('Pedido no encontrado.', 404);
      }

      const detalles = await PedidoModel.getDetalles(id);
      res.json({ ...pedido, detalles });
    } catch (error) {
      next(error);
    }
  },

  async create(req, res, next) {
    try {
      const { mesa_id, tipo, items, notas, direccion_entrega, ciudad, referencia } = req.body;

      if (!items || items.length === 0) {
        throw new AppError('Items del pedido requeridos.', 400);
      }

      if (tipo === 'domicilio' && !direccion_entrega) {
        throw new AppError('Dirección de entrega requerida para pedidos a domicilio.', 400);
      }

      const pedidoData = {
        cliente_id: req.user.rol === 'cliente' ? req.user.id : null,
        mesero_id: req.user.rol !== 'cliente' ? req.user.id : null,
        mesa_id,
        tipo,
        direccion_entrega,
        ciudad,
        referencia,
        items,
        notas
      };

      const pedido = await PedidoModel.create(pedidoData);

      res.status(201).json(pedido);
    } catch (error) {
      next(error);
    }
  },

  async updateStatus(req, res, next) {
    try {
      const { id } = req.params;
      const { estado, motivo_cancelacion } = req.body;

      const validStates = ['pendiente', 'en_cocina', 'listo', 'entregado', 'cancelado'];
      if (!validStates.includes(estado)) {
        throw new AppError('Estado inválido.', 400);
      }

      const pedido = await PedidoModel.updateStatus(id, estado, motivo_cancelacion);

      if (!pedido) {
        throw new AppError('Pedido no encontrado.', 404);
      }

      res.json(pedido);
    } catch (error) {
      next(error);
    }
  },

  async reasignarMesero(req, res, next) {
    try {
      const { id } = req.params;
      const { mesero_id } = req.body;

      const pedido = await PedidoModel.reasignarMesero(id, mesero_id);

      if (!pedido) {
        throw new AppError('Pedido no encontrado.', 404);
      }

      res.json(pedido);
    } catch (error) {
      next(error);
    }
  },

  async updatePayment(req, res, next) {
    try {
      const { id } = req.params;
      const { metodo_pago, estado_pago } = req.body;

      const pedido = await PedidoModel.updatePayment(id, metodo_pago, estado_pago);

      if (!pedido) {
        throw new AppError('Pedido no encontrado.', 404);
      }

      res.json(pedido);
    } catch (error) {
      next(error);
    }
  },

  async getStats(req, res, next) {
    try {
      const { rango } = req.query;
      let stats;

      if (rango === 'semana') {
        const startDate = new Date();
        startDate.setDate(startDate.getDate() - 7);
        stats = await PedidoModel.getStatsRange(startDate, new Date());
      } else if (rango === 'mes') {
        const startDate = new Date();
        startDate.setMonth(startDate.getMonth() - 1);
        stats = await PedidoModel.getStatsRange(startDate, new Date());
      } else {
        stats = await PedidoModel.getStatsDaily();
      }

      res.json(stats);
    } catch (error) {
      next(error);
    }
  }
};

export default { PedidoController };