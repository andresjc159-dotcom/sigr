const API_BASE = import.meta.env.VITE_API_BASE || 'http://localhost:3000/api/v1';

const getHeaders = () => {
  const token = localStorage.getItem('accessToken');
  return {
    ...(token && { Authorization: `Bearer ${token}` })
  };
};

const getJsonHeaders = () => {
  return {
    'Content-Type': 'application/json',
    ...getHeaders()
  };
};

const handleResponse = async (response) => {
  const text = await response.text();
  let data;
  try {
    data = JSON.parse(text);
  } catch (e) {
    throw new Error(`Respuesta inválida del servidor: ${response.status} - ${text.substring(0, 100)}`);
  }
  
  if (response.status === 401) {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    window.location.href = '/login';
    throw new Error('Sesión expirada. Inicia sesión nuevamente.');
  }
  if (!response.ok) {
    throw new Error(data.message || data.error || `Error: ${response.status}`);
  }
  return data;
};

export const authService = {
  login: async (email, password) => {
    const response = await fetch(`${API_BASE}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    });
    const data = await handleResponse(response);
    return data;
  },
  
  logout: async () => {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
  },
  
  getProfile: async () => {
    const response = await fetch(`${API_BASE}/auth/profile`, { headers: getHeaders() });
    return handleResponse(response);
  },

  refresh: async (refreshToken) => {
    const response = await fetch(`${API_BASE}/auth/refresh`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ refreshToken })
    });
    return handleResponse(response);
  }
};

export const menuService = {
  getCategories: async () => {
    const response = await fetch(`${API_BASE}/categorias`);
    return handleResponse(response);
  },
  
  getProducts: async (categoriaId) => {
    const url = categoriaId ? `${API_BASE}/products?categoria=${categoriaId}` : `${API_BASE}/products`;
    const response = await fetch(url);
    return handleResponse(response);
  }
};

export const categoryService = {
  getCategories: async () => {
    const response = await fetch(`${API_BASE}/categorias`);
    return handleResponse(response);
  },

  createCategory: async (data) => {
    const response = await fetch(`${API_BASE}/categorias`, {
      method: 'POST',
      headers: getJsonHeaders(),
      body: JSON.stringify(data)
    });
    return handleResponse(response);
  },

  updateCategory: async (id, data) => {
    const response = await fetch(`${API_BASE}/categorias/${id}`, {
      method: 'PUT',
      headers: getJsonHeaders(),
      body: JSON.stringify(data)
    });
    return handleResponse(response);
  },

  deleteCategory: async (id) => {
    const response = await fetch(`${API_BASE}/categorias/${id}`, {
      method: 'DELETE',
      headers: getHeaders()
    });
    return handleResponse(response);
  }
};

export const productService = {
  getProducts: async () => {
    const response = await fetch(`${API_BASE}/products`);
    return handleResponse(response);
  },
  
  getProduct: async (id) => {
    const response = await fetch(`${API_BASE}/products/${id}`);
    return handleResponse(response);
  },

  createProduct: async (data) => {
    const response = await fetch(`${API_BASE}/products`, {
      method: 'POST',
      headers: getJsonHeaders(),
      body: JSON.stringify(data)
    });
    return handleResponse(response);
  },
  
  updateProduct: async (id, data) => {
    const response = await fetch(`${API_BASE}/products/${id}`, {
      method: 'PUT',
      headers: getJsonHeaders(),
      body: JSON.stringify(data)
    });
    return handleResponse(response);
  },
  
  updateStock: async (id, cantidad) => {
    const response = await fetch(`${API_BASE}/products/${id}/stock`, {
      method: 'PATCH',
      headers: getJsonHeaders(),
      body: JSON.stringify({ cantidad })
    });
    return handleResponse(response);
  },
  
  deleteProduct: async (id) => {
    const response = await fetch(`${API_BASE}/products/${id}`, {
      method: 'DELETE',
      headers: getHeaders()
    });
    return handleResponse(response);
  },

  uploadImage: async (id, file) => {
    const formData = new FormData();
    formData.append('imagen', file);
    const token = localStorage.getItem('accessToken');
    const response = await fetch(`${API_BASE}/products/${id}/image`, {
      method: 'POST',
      headers: {
        ...(token && { Authorization: `Bearer ${token}` })
      },
      body: formData
    });
    return handleResponse(response);
  }
};

export const employeeService = {
  getEmployees: async () => {
    const response = await fetch(`${API_BASE}/employees`, { headers: getHeaders() });
    return handleResponse(response);
  },
  
  createEmployee: async (data) => {
    const response = await fetch(`${API_BASE}/employees`, {
      method: 'POST',
      headers: getJsonHeaders(),
      body: JSON.stringify(data)
    });
    return handleResponse(response);
  },

  updateEmployee: async (id, data) => {
    const response = await fetch(`${API_BASE}/employees/${id}`, {
      method: 'PUT',
      headers: getJsonHeaders(),
      body: JSON.stringify(data)
    });
    return handleResponse(response);
  },

  toggleEmployeeStatus: async (id) => {
    const response = await fetch(`${API_BASE}/employees/${id}/toggle-status`, {
      method: 'PATCH',
      headers: getJsonHeaders()
    });
    return handleResponse(response);
  }
};

export const tableService = {
  getTables: async () => {
    const response = await fetch(`${API_BASE}/tables`);
    return handleResponse(response);
  },
  
  createTable: async (data) => {
    const response = await fetch(`${API_BASE}/tables`, {
      method: 'POST',
      headers: getJsonHeaders(),
      body: JSON.stringify(data)
    });
    return handleResponse(response);
  },

  updateTable: async (id, data) => {
    const response = await fetch(`${API_BASE}/tables/${id}`, {
      method: 'PUT',
      headers: getJsonHeaders(),
      body: JSON.stringify(data)
    });
    return handleResponse(response);
  },
  
  updateStatus: async (id, estado) => {
    const response = await fetch(`${API_BASE}/tables/${id}/status`, {
      method: 'PATCH',
      headers: getJsonHeaders(),
      body: JSON.stringify({ estado })
    });
    return handleResponse(response);
  },

  deleteTable: async (id) => {
    const response = await fetch(`${API_BASE}/tables/${id}`, {
      method: 'DELETE',
      headers: getHeaders()
    });
    return handleResponse(response);
  }
};

export const orderService = {
  getOrders: async () => {
    const response = await fetch(`${API_BASE}/orders`, { headers: getHeaders() });
    return handleResponse(response);
  },
  
  createOrder: async (data) => {
    const response = await fetch(`${API_BASE}/orders`, {
      method: 'POST',
      headers: getJsonHeaders(),
      body: JSON.stringify(data)
    });
    return handleResponse(response);
  },
  
  updateStatus: async (id, estado, motivo) => {
    const response = await fetch(`${API_BASE}/orders/${id}/status`, {
      method: 'PATCH',
      headers: getJsonHeaders(),
      body: JSON.stringify({ estado, motivo })
    });
    return handleResponse(response);
  },

  confirmPayment: async (id, metodo_pago, estado_pago) => {
    const response = await fetch(`${API_BASE}/orders/${id}/payment`, {
      method: 'PATCH',
      headers: getJsonHeaders(),
      body: JSON.stringify({ metodo_pago, estado_pago })
    });
    return handleResponse(response);
  }
};

export const salesService = {
  getDaily: async (fecha) => {
    const url = fecha ? `${API_BASE}/sales/daily?fecha=${fecha}` : `${API_BASE}/sales/daily`;
    const response = await fetch(url, { headers: getHeaders() });
    return handleResponse(response);
  },

  exportDaily: async (fecha) => {
    const url = fecha ? `${API_BASE}/sales/daily/export?fecha=${fecha}` : `${API_BASE}/sales/daily/export`;
    const response = await fetch(url, { headers: getHeaders() });
    if (!response.ok) {
      const data = await response.json().catch(() => ({}));
      throw new Error(data.message || `Error: ${response.status}`);
    }
    return response.text();
  }
};

export const themeService = {
  get: async () => {
    const response = await fetch(`${API_BASE}/config/theme`);
    return handleResponse(response);
  },

  update: async (data) => {
    const response = await fetch(`${API_BASE}/config/theme`, {
      method: 'PUT',
      headers: getJsonHeaders(),
      body: JSON.stringify(data)
    });
    return handleResponse(response);
  }
};

export const reservationService = {
  create: async (data) => {
    const response = await fetch(`${API_BASE}/reservations`, {
      method: 'POST',
      headers: getJsonHeaders(),
      body: JSON.stringify(data)
    });
    return handleResponse(response);
  },

  getAvailability: async (fecha) => {
    const response = await fetch(`${API_BASE}/reservations/availability?fecha=${fecha}`);
    return handleResponse(response);
  },

  getMyReservations: async () => {
    const response = await fetch(`${API_BASE}/reservations/my`, { headers: getHeaders() });
    return handleResponse(response);
  },

  getAllReservations: async () => {
    const response = await fetch(`${API_BASE}/reservations`, { headers: getHeaders() });
    return handleResponse(response);
  },

  assignTable: async (id, mesa_id) => {
    const response = await fetch(`${API_BASE}/reservations/${id}/table`, {
      method: 'PATCH',
      headers: getJsonHeaders(),
      body: JSON.stringify({ mesa_id })
    });
    return handleResponse(response);
  }
};

export const toppingService = {
  getToppings: async () => {
    const response = await fetch(`${API_BASE}/toppings`, { headers: getHeaders() });
    return handleResponse(response);
  },
  
  createTopping: async (data) => {
    const response = await fetch(`${API_BASE}/toppings`, {
      method: 'POST',
      headers: getJsonHeaders(),
      body: JSON.stringify(data)
    });
    return handleResponse(response);
  },

  updateTopping: async (id, data) => {
    const response = await fetch(`${API_BASE}/toppings/${id}`, {
      method: 'PUT',
      headers: getJsonHeaders(),
      body: JSON.stringify(data)
    });
    return handleResponse(response);
  },

  deleteTopping: async (id) => {
    const response = await fetch(`${API_BASE}/toppings/${id}`, {
      method: 'DELETE',
      headers: getHeaders()
    });
    return handleResponse(response);
  }
};

export const cartService = {
  getCart: () => {
    const cart = localStorage.getItem('cart');
    return cart ? JSON.parse(cart) : [];
  },
  
  saveCart: (items) => {
    localStorage.setItem('cart', JSON.stringify(items));
  },
  
  addItem: (product, quantity = 1, observations = '', toppings = []) => {
    const cart = cartService.getCart();
    cart.push({ 
      id: product.id, 
      name: product.nombre, 
      precio: product.precio, 
      cantidad: quantity, 
      observations, 
      toppings,
      imagen: product.imagen, 
      categoria: product.categoria_nombre 
    });
    cartService.saveCart(cart);
    return cart;
  },
  
  updateQuantity: (index, cantidad) => {
    const cart = cartService.getCart();
    if (cart[index] && cantidad > 0) {
      cart[index].cantidad = cantidad;
      cartService.saveCart(cart);
    }
    return cart;
  },
  
  removeItem: (index) => {
    const cart = cartService.getCart();
    cart.splice(index, 1);
    cartService.saveCart(cart);
    return cart;
  },
  
  clearCart: () => {
    cartService.saveCart([]);
  },
  
  getTotal: () => {
    const cart = cartService.getCart();
    return cart.reduce((total, item) => {
      const toppingsTotal = item.toppings?.reduce((t, top) => t + parseFloat(top.precio || 0), 0) || 0;
      return total + (parseFloat(item.precio) + toppingsTotal) * item.cantidad;
    }, 0);
  }
};

export default {
  authService,
  menuService,
  categoryService,
  productService,
  employeeService,
  tableService,
  orderService,
  salesService,
  reservationService,
  toppingService,
  cartService,
  themeService
};
