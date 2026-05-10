const raw = import.meta.env.VITE_API_BASE || 'http://localhost:3000';
const API_BASE = raw.endsWith('/api/v1') ? raw : `${raw.replace(/\/+$/, '')}/api/v1`;
const IMG_BASE = import.meta.env.VITE_IMG_BASE || 'http://localhost:3000';

export { API_BASE, IMG_BASE };
