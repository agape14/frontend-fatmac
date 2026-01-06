import api from './api';

export const productService = {
  // Obtener todos los productos con filtros opcionales
  getAll: (params = {}) => {
    return api.get('/products', { params });
  },

  // Obtener un producto por ID
  getById: (id) => {
    return api.get(`/products/${id}`);
  },

  // Crear un nuevo producto
  create: (data) => {
    return api.post('/products', data, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
  },

  // Actualizar un producto
  update: (id, data) => {
    // Usar POST con _method=PUT para FormData
    data.append('_method', 'PUT');
    return api.post(`/products/${id}`, data, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
  },

  // Eliminar un producto
  delete: (id) => {
    return api.delete(`/products/${id}`);
  },
};

