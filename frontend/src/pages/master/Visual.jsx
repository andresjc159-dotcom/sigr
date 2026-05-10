import { useState } from 'react';
import { useTheme } from '../../context/ThemeContext';

const MasterVisual = () => {
  const { theme, updateTheme, refreshTheme } = useTheme();
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(null);
  const [localConfig, setLocalConfig] = useState(theme || {});

  const handleChange = (field, value) => {
    setLocalConfig({ ...localConfig, [field]: value });
  };

  const guardar = async () => {
    setSaving(true);
    try {
      await updateTheme(localConfig);
      alert('Configuración guardada correctamente');
    } catch (error) {
      alert('Error: ' + error.message);
    } finally {
      setSaving(false);
    }
  };

  const subirLogo = async (tipo) => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    input.onchange = async (e) => {
      const file = e.target.files[0];
      if (!file) return;

      const formData = new FormData();
      formData.append('imagen', file);

      setUploading(tipo);
      try {
        const token = localStorage.getItem('accessToken');
        const response = await fetch(`http://localhost:3000/api/v1/upload/config/${tipo}`, {
          method: 'POST',
          headers: { Authorization: `Bearer ${token}` },
          body: formData
        });

        const data = await response.json();
        if (response.ok) {
          const newConfig = { ...localConfig, [tipo]: data.path };
          setLocalConfig(newConfig);
          await updateTheme(newConfig);
          alert('Logo subido correctamente');
        } else {
          alert(data.message || 'Error al subir imagen');
        }
      } catch (error) {
        alert('Error: ' + error.message);
      } finally {
        setUploading(null);
      }
    };
    input.click();
  };

  if (!theme) return <div style={{ padding: 40 }}>Cargando...</div>;

  return (
    <div style={{ padding: 40 }}>
      <h1 style={{ marginBottom: 24 }}>Personalización Visual</h1>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24 }}>
        <div style={{ background: 'white', padding: 24, borderRadius: 12 }}>
          <h2 style={{ marginTop: 0 }}>Colores</h2>
          
          <div style={{ marginBottom: 16 }}>
            <label style={{ display: 'block', fontSize: 14, color: '#6c757d', marginBottom: 8 }}>Color Primario</label>
            <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
              <input
                type="color"
                value={localConfig.color_primario || '#C0392B'}
                onChange={(e) => handleChange('color_primario', e.target.value)}
                style={{ width: 60, height: 40, cursor: 'pointer' }}
              />
              <input
                type="text"
                value={localConfig.color_primario || ''}
                onChange={(e) => handleChange('color_primario', e.target.value)}
                style={{ padding: 8, border: '2px solid #dee2e6', borderRadius: 6, width: 100, fontFamily: 'monospace' }}
              />
            </div>
          </div>

          <div style={{ marginBottom: 16 }}>
            <label style={{ display: 'block', fontSize: 14, color: '#6c757d', marginBottom: 8 }}>Color Secundario</label>
            <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
              <input
                type="color"
                value={localConfig.color_secundario || '#2C2C2A'}
                onChange={(e) => handleChange('color_secundario', e.target.value)}
                style={{ width: 60, height: 40, cursor: 'pointer' }}
              />
              <input
                type="text"
                value={localConfig.color_secundario || ''}
                onChange={(e) => handleChange('color_secundario', e.target.value)}
                style={{ padding: 8, border: '2px solid #dee2e6', borderRadius: 6, width: 100, fontFamily: 'monospace' }}
              />
            </div>
          </div>

          <div style={{ marginBottom: 16 }}>
            <label style={{ display: 'block', fontSize: 14, color: '#6c757d', marginBottom: 8 }}>Color Acento</label>
            <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
              <input
                type="color"
                value={localConfig.color_acento || '#E74C3C'}
                onChange={(e) => handleChange('color_acento', e.target.value)}
                style={{ width: 60, height: 40, cursor: 'pointer' }}
              />
              <input
                type="text"
                value={localConfig.color_acento || ''}
                onChange={(e) => handleChange('color_acento', e.target.value)}
                style={{ padding: 8, border: '2px solid #dee2e6', borderRadius: 6, width: 100, fontFamily: 'monospace' }}
              />
            </div>
          </div>

          <h2 style={{ marginTop: 24 }}>Tema</h2>
          <div style={{ display: 'flex', gap: 16 }}>
            <label style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer' }}>
              <input
                type="radio"
                name="modo_tema"
                value="claro"
                checked={localConfig.modo_tema === 'claro'}
                onChange={(e) => handleChange('modo_tema', e.target.value)}
              />
              Claro ☀️
            </label>
            <label style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer' }}>
              <input
                type="radio"
                name="modo_tema"
                value="oscuro"
                checked={localConfig.modo_tema === 'oscuro'}
                onChange={(e) => handleChange('modo_tema', e.target.value)}
              />
              Oscuro 🌙
            </label>
          </div>

          <h2 style={{ marginTop: 24 }}>Información del Restaurante</h2>
          
          <div style={{ marginBottom: 12 }}>
            <label style={{ display: 'block', fontSize: 14, color: '#6c757d', marginBottom: 8 }}>Nombre</label>
            <input
              type="text"
              value={localConfig.nombre_restaurante || ''}
              onChange={(e) => handleChange('nombre_restaurante', e.target.value)}
              style={{ width: '100%', padding: 12, border: '2px solid #dee2e6', borderRadius: 8, boxSizing: 'border-box' }}
            />
          </div>

          <div style={{ marginBottom: 16 }}>
            <label style={{ display: 'block', fontSize: 14, color: '#6c757d', marginBottom: 8 }}>Slogan</label>
            <input
              type="text"
              value={localConfig.slogan || ''}
              onChange={(e) => handleChange('slogan', e.target.value)}
              style={{ width: '100%', padding: 12, border: '2px solid #dee2e6', borderRadius: 8, boxSizing: 'border-box' }}
              placeholder="Los mejores pasteles..."
            />
          </div>

          <h2 style={{ marginTop: 24 }}>Logos</h2>
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 16 }}>
            <button onClick={() => subirLogo('logo_principal')} disabled={uploading === 'logo_principal'} style={{ padding: '10px 16px', background: '#f0f9ff', color: '#0369a1', border: '1px solid #7dd3fc', borderRadius: 8, cursor: 'pointer' }}>
              {uploading === 'logo_principal' ? 'Subiendo...' : 'Logo Principal'}
            </button>
            <button onClick={() => subirLogo('logo_blanco')} disabled={uploading === 'logo_blanco'} style={{ padding: '10px 16px', background: '#f0f9ff', color: '#0369a1', border: '1px solid #7dd3fc', borderRadius: 8, cursor: 'pointer' }}>
              {uploading === 'logo_blanco' ? 'Subiendo...' : 'Logo Blanco'}
            </button>
            <button onClick={() => subirLogo('favicon')} disabled={uploading === 'favicon'} style={{ padding: '10px 16px', background: '#f0f9ff', color: '#0369a1', border: '1px solid #7dd3fc', borderRadius: 8, cursor: 'pointer' }}>
              {uploading === 'favicon' ? 'Subiendo...' : 'Favicon'}
            </button>
          </div>

          {localConfig.logo_principal && (
            <div style={{ marginBottom: 16, padding: 12, background: '#f8f9fa', borderRadius: 8, display: 'flex', alignItems: 'center', gap: 12 }}>
              <img src={`http://localhost:3000${localConfig.logo_principal}`} alt="Logo" style={{ width: 60, height: 60, objectFit: 'contain' }} />
              <span style={{ fontSize: 12, color: '#6c757d' }}>Logo configurado</span>
            </div>
          )}

          <button onClick={guardar} disabled={saving} style={{ padding: '12px 24px', background: '#e63946', color: 'white', border: 'none', borderRadius: 8, cursor: 'pointer', width: '100%', fontSize: 16 }}>
            {saving ? 'Guardando...' : '💾 Guardar Configuración'}
          </button>
        </div>

        <div style={{ background: 'white', padding: 24, borderRadius: 12 }}>
          <h2 style={{ marginTop: 0 }}>Vista Previa en Tiempo Real</h2>
          
          <div style={{ 
            background: localConfig.color_primario || '#C0392B', 
            color: 'white', 
            padding: 30, 
            borderRadius: 12,
            textAlign: 'center',
            marginBottom: 16
          }}>
            <h1 style={{ margin: 0, fontSize: 28 }}>{localConfig.nombre_restaurante || 'Red Velvet'}</h1>
            <p style={{ margin: '8px 0 0', opacity: 0.9 }}>{localConfig.slogan || ''}</p>
          </div>

          <div style={{ 
            background: localConfig.color_secundario || '#2C2C2A', 
            color: 'white', 
            padding: 20, 
            borderRadius: 12,
            textAlign: 'center',
            marginBottom: 16
          }}>
            <p style={{ margin: 0 }}>Color Secundario</p>
          </div>

          <div style={{ 
            background: localConfig.color_acento || '#E74C3C', 
            color: 'white', 
            padding: 20, 
            borderRadius: 12,
            textAlign: 'center',
            marginBottom: 16
          }}>
            <p style={{ margin: 0 }}>Color Acento</p>
          </div>

          <div style={{ 
            padding: 20, 
            borderRadius: 12,
            textAlign: 'center',
            background: localConfig.modo_tema === 'oscuro' ? '#1a1a2e' : '#ffffff',
            color: localConfig.modo_tema === 'oscuro' ? '#ffffff' : '#1a1a1a',
            border: `2px solid ${localConfig.color_primario || '#C0392B'}`,
            marginBottom: 16
          }}>
            <p style={{ margin: 0 }}>
              Modo: <strong>{localConfig.modo_tema === 'oscuro' ? '🌙 Oscuro' : '☀️ Claro'}</strong>
            </p>
          </div>

          <div style={{ padding: 16, background: '#f8f9fa', borderRadius: 8 }}>
            <p style={{ margin: 0, fontSize: 14, color: '#6c757d' }}>
              Los cambios se aplicarán a toda la aplicación al guardar
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MasterVisual;