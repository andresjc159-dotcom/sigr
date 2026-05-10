import jwt from 'jsonwebtoken';
import { UserModel } from '../models/User.js';
import { AppError } from './errorHandler.js';

export const generateTokens = (user) => {
  const accessToken = jwt.sign(
    { id: user.id, email: user.email, rol: user.rol },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN || '15m' }
  );

  const refreshToken = jwt.sign(
    { id: user.id },
    process.env.JWT_REFRESH_SECRET,
    { expiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '7d' }
  );

  return { accessToken, refreshToken };
};

export const verifyAccessToken = (token) => {
  return jwt.verify(token, process.env.JWT_SECRET);
};

export const verifyRefreshToken = (token) => {
  return jwt.verify(token, process.env.JWT_REFRESH_SECRET);
};

export const authenticate = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw new AppError('No autorizado. Token requerido.', 401);
    }

    const token = authHeader.split(' ')[1];
    const decoded = verifyAccessToken(token);

    const user = await UserModel.findById(decoded.id);
    if (!user) {
      throw new AppError('Usuario no encontrado.', 401);
    }

    if (user.estado !== 'activo') {
      throw new AppError('Cuenta inactiva.', 401);
    }

    req.user = user;
    next();
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      next(new AppError('Token expirado.', 401));
    } else if (error.name === 'JsonWebTokenError') {
      next(new AppError('Token inválido.', 401));
    } else {
      next(error);
    }
  }
};

export const refreshToken = async (req, res, next) => {
  try {
    const { refreshToken: token } = req.body;

    if (!token) {
      throw new AppError('Refresh token requerido.', 400);
    }

    const decoded = verifyRefreshToken(token);
    const user = await UserModel.findById(decoded.id);

    if (!user || user.refresh_token !== token) {
      throw new AppError('Refresh token inválido.', 401);
    }

    const tokens = generateTokens(user);
    
    await UserModel.updateRefreshToken(user.id, tokens.refreshToken);

    res.json({
      accessToken: tokens.accessToken,
      refreshToken: tokens.refreshToken,
      user: {
        id: user.id,
        nombre: user.nombre,
        apellido: user.apellido,
        email: user.email,
        rol: user.rol
      }
    });
  } catch (error) {
    next(error);
  }
};

export default { generateTokens, verifyAccessToken, verifyRefreshToken, authenticate, refreshToken };