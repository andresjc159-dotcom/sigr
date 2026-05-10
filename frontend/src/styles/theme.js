export const defaultTheme = {
  colorPrimary: '#e63946',
  colorSecondary: '#1a1a2e',
  colorAccent: '#E74C3C',
  mode: 'claro'
};

export const applyTheme = (theme) => {
  const root = document.documentElement;
  
  if (theme) {
    const primary = theme.color_primario || theme.colorPrimary || defaultTheme.colorPrimary;
    const secondary = theme.color_secundario || theme.colorSecondary || defaultTheme.colorSecondary;
    const accent = theme.color_acento || theme.colorAccent || defaultTheme.colorAccent;
    const mode = theme.modo_tema || theme.mode || 'claro';
    
    root.style.setProperty('--color-primary', primary);
    root.style.setProperty('--color-primary-hover', adjustColor(primary, -20));
    root.style.setProperty('--color-secondary', secondary);
    root.style.setProperty('--color-accent', accent);
    root.style.setProperty('--color-background', mode === 'oscuro' ? '#1a1a2e' : '#ffffff');
    root.style.setProperty('--color-text', mode === 'oscuro' ? '#ffffff' : '#1a1a1a');
    
    if (mode === 'oscuro') {
      root.setAttribute('data-theme', 'dark');
    } else {
      root.removeAttribute('data-theme');
    }
  }
};

const adjustColor = (hex, amount) => {
  const num = parseInt(hex.replace('#', ''), 16);
  const r = Math.min(255, Math.max(0, (num >> 16) + amount));
  const g = Math.min(255, Math.max(0, ((num >> 8) & 0x00FF) + amount));
  const b = Math.min(255, Math.max(0, (num & 0x0000FF) + amount));
  return `#${(1 << 24 | r << 16 | g << 8 | b).toString(16).slice(1)}`;
};

export default { defaultTheme, applyTheme };