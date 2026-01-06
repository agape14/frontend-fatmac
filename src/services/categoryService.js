import api from './api';

export const categoryService = {
  // Obtener todas las categorías
  getAll: () => {
    return api.get('/categories');
  },

  // Obtener una categoría por ID
  getById: (id) => {
    return api.get(`/categories/${id}`);
  },
};

