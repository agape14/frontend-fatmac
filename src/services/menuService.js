import api from './api';

export const menuService = {
  // Obtener todos los items del menú activos
  getAll: () => {
    return api.get('/menu-items');
  },
};

