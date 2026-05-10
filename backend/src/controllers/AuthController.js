import { UserModel } from '../models/User.js';
import { generateTokens } from '../middleware/auth.js';
import { AppError } from '../middleware/errorHandler.js';

export const AuthController = {
  async login(req, res, next) {
    try {
      const { email, password } = req.body;

      if (!email || !password) {
        throw new AppError('Email y contraseña requeridos.', 400);
      }

      const user = await UserModel.findByEmail(email);
      if (!user) {
        throw new AppError('Credenciales inválidas.', 401);
      }

      if (user.estado !== 'activo') {
        throw new AppError('Cuenta inactiva. Contacta al administrador.', 401);
      }

      const isValid = await UserModel.validatePassword(user, password);
      if (!isValid) {
        throw new AppError('Credenciales inválidas.', 401);
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
          rol: user.rol,
          foto_perfil: user.foto_perfil
        }
      });
    } catch (error) {
      next(error);
    }
  },

  async register(req, res, next) {
    try {
      const { nombre, apellido, email, telefono, password } = req.body;

      if (!nombre || !apellido || !email || !password) {
        throw new AppError('Nombre, apellido, email y contraseña son requeridos.', 400);
      }

      const existingUser = await UserModel.findByEmail(email);
      if (existingUser) {
        throw new AppError('El email ya está registrado.', 400);
      }

      const user = await UserModel.create({ nombre, apellido, email, telefono, password, rol: 'cliente' });

      const tokens = generateTokens(user);
      await UserModel.updateRefreshToken(user.id, tokens.refreshToken);

      res.status(201).json({
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
  },

  async profile(req, res, next) {
    try {
      const user = await UserModel.findById(req.user.id);
      if (!user) {
        throw new AppError('Usuario no encontrado.', 404);
      }

      res.json({
        id: user.id,
        nombre: user.nombre,
        apellido: user.apellido,
        email: user.email,
        telefono: user.telefono,
        rol: user.rol,
        foto_perfil: user.foto_perfil,
        ultimo_acceso: user.ultimo_acceso,
        creado_en: user.creado_en
      });
    } catch (error) {
      next(error);
    }
  },

  async logout(req, res, next) {
    try {
      await UserModel.updateRefreshToken(req.user.id, null);

      res.json({ message: 'Sesión cerrada correctamente.' });
    } catch (error) {
      next(error);
    }
  },

  async changePassword(req, res, next) {
    try {
      const { passwordActual, passwordNuevo } = req.body;

      if (!passwordActual || !passwordNuevo) {
        throw new AppError('Contraseñas requeridas.', 400);
      }

      const user = await UserModel.findById(req.user.id);
      const isValid = await UserModel.validatePassword(user, passwordActual);

      if (!isValid) {
        throw new AppError('Contraseña actual incorrecta.', 400);
      }

      await UserModel.update(req.user.id, { password: passwordNuevo });

      res.json({ message: 'Contraseña actualizada correctamente.' });
    } catch (error) {
      next(error);
    }
  }
};

export default { AuthController };