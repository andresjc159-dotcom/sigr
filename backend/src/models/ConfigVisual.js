import { query } from '../config/database.js';

export const ConfigVisualModel = {
  async getActive() {
    const result = await query(
      'SELECT * FROM configuracion_visual WHERE activo = TRUE'
    );
    return result.rows[0];
  },

  async update(id, data) {
    const {
      logo_principal,
      logo_blanco,
      favicon,
      color_primario,
      color_secundario,
      color_acento,
      modo_tema,
      nombre_restaurante,
      slogan,
      actualizado_por
    } = data;

    const fields = [];
    const params = [];

    if (logo_principal !== undefined) {
      params.push(logo_principal);
      fields.push(`logo_principal = $${params.length}`);
    }
    if (logo_blanco !== undefined) {
      params.push(logo_blanco);
      fields.push(`logo_blanco = $${params.length}`);
    }
    if (favicon !== undefined) {
      params.push(favicon);
      fields.push(`favicon = $${params.length}`);
    }
    if (color_primario !== undefined) {
      params.push(color_primario);
      fields.push(`color_primario = $${params.length}`);
    }
    if (color_secundario !== undefined) {
      params.push(color_secundario);
      fields.push(`color_secundario = $${params.length}`);
    }
    if (color_acento !== undefined) {
      params.push(color_acento);
      fields.push(`color_acento = $${params.length}`);
    }
    if (modo_tema !== undefined) {
      params.push(modo_tema);
      fields.push(`modo_tema = $${params.length}`);
    }
    if (nombre_restaurante !== undefined) {
      params.push(nombre_restaurante);
      fields.push(`nombre_restaurante = $${params.length}`);
    }
    if (slogan !== undefined) {
      params.push(slogan);
      fields.push(`slogan = $${params.length}`);
    }
    if (actualizado_por !== undefined) {
      params.push(actualizado_por);
      fields.push(`actualizado_por = $${params.length}`);
    }

    if (fields.length === 0) return this.getActive();

    params.push(id);
    const sql = `UPDATE configuracion_visual SET ${fields.join(', ')} WHERE id = $${params.length} RETURNING *`;

    const result = await query(sql, params);
    return result.rows[0];
  },

  async create(data) {
    await query('UPDATE configuracion_visual SET activo = FALSE WHERE activo = TRUE');
    
    const {
      logo_principal,
      logo_blanco,
      favicon,
      color_primario,
      color_secundario,
      color_acento,
      modo_tema,
      nombre_restaurante,
      slogan,
      actualizado_por
    } = data;

    const result = await query(
      `INSERT INTO configuracion_visual 
       (logo_principal, logo_blanco, favicon, color_primario, color_secundario, 
        color_acento, modo_tema, nombre_restaurante, slogan, activo, actualizado_por)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, TRUE, $10)
       RETURNING *`,
      [logo_principal, logo_blanco, favicon, color_primario, color_secundario,
       color_acento, modo_tema, nombre_restaurante, slogan, actualizado_por]
    );
    return result.rows[0];
  }
};

export default { ConfigVisualModel };