import { ConfigVisualModel } from '../models/ConfigVisual.js';
import { AppError } from '../middleware/errorHandler.js';
import path from 'path';

export const ConfigVisualController = {
  async getTheme(req, res, next) {
    try {
      const config = await ConfigVisualModel.getActive();
      
      if (!config) {
        throw new AppError('Configuración no encontrada.', 404);
      }

      const baseUrl = `${req.protocol}://${req.get('host')}`;
      
      res.json({
        id: config.id,
        colorPrimary: config.color_primario,
        colorSecondary: config.color_secundario,
        colorAccent: config.color_acento,
        mode: config.modo_tema,
        nombreRestaurante: config.nombre_restaurante,
        slogan: config.slogan,
        logoUrl: config.logo_principal ? `${baseUrl}/uploads/${path.basename(config.logo_principal)}` : null,
        logoWhiteUrl: config.logo_blanco ? `${baseUrl}/uploads/${path.basename(config.logo_blanco)}` : null,
        faviconUrl: config.favicon ? `${baseUrl}/uploads/${path.basename(config.favicon)}` : null
      });
    } catch (error) {
      next(error);
    }
  },

  async updateTheme(req, res, next) {
    try {
      const config = await ConfigVisualModel.getActive();
      
      if (!config) {
        throw new AppError('Configuración no encontrada.', 404);
      }

      const updateData = { ...req.body, actualizado_por: req.user.id };
      
      const updated = await ConfigVisualModel.update(config.id, updateData);

      const baseUrl = `${req.protocol}://${req.get('host')}`;
      
      res.json({
        id: updated.id,
        colorPrimary: updated.color_primario,
        colorSecondary: updated.color_secundario,
        colorAccent: updated.color_acento,
        mode: updated.modo_tema,
        nombreRestaurante: updated.nombre_restaurante,
        slogan: updated.slogan,
        logoUrl: updated.logo_principal ? `${baseUrl}/uploads/${path.basename(updated.logo_principal)}` : null,
        logoWhiteUrl: updated.logo_blanco ? `${baseUrl}/uploads/${path.basename(updated.logo_blanco)}` : null,
        faviconUrl: updated.favicon ? `${baseUrl}/uploads/${path.basename(updated.favicon)}` : null
      });
    } catch (error) {
      next(error);
    }
  },

  async uploadLogo(req, res, next) {
    try {
      if (!req.file) {
        throw new AppError('Archivo no proporcionado.', 400);
      }

      const config = await ConfigVisualModel.getActive();
      const fieldName = req.file.fieldname === 'favicon' ? 'favicon' : `${req.file.fieldname}_url`;
      
      const updateData = { [fieldName]: req.file.path, actualizado_por: req.user.id };
      
      const updated = await ConfigVisualModel.update(config.id, updateData);

      const baseUrl = `${req.protocol}://${req.get('host')}`;
      
      res.json({
        message: 'Logo subido correctamente.',
        logoUrl: updated.logo_principal ? `${baseUrl}/uploads/${path.basename(updated.logo_principal)}` : null,
        logoWhiteUrl: updated.logo_blanco ? `${baseUrl}/uploads/${path.basename(updated.logo_blanco)}` : null,
        faviconUrl: updated.favicon ? `${baseUrl}/uploads/${path.basename(updated.favicon)}` : null
      });
    } catch (error) {
      next(error);
    }
  }
};

export default { ConfigVisualController };