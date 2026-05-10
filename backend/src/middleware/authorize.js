import { AppError } from './errorHandler.js';

export const authorize = (...allowedRoles) => {
  return (req, res, next) => {
    if (!req.user) {
      return next(new AppError('No autorizado.', 401));
    }

    if (!allowedRoles.includes(req.user.rol)) {
      return next(new AppError('No tienes permiso para acceder a este recurso.', 403));
    }

    next();
  };
};

export const requireMaster = authorize('master');
export const requireAdmin = authorize('master', 'administrador');
export const requireMesero = authorize('master', 'administrador', 'mesero');
export const requireCliente = authorize('cliente');
export const requireAllInternal = authorize('master', 'administrador', 'mesero');

export default { authorize, requireMaster, requireAdmin, requireMesero, requireCliente, requireAllInternal };