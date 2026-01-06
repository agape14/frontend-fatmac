import api from './api';

export const vendorService = {
  // Obtener todos los vendedores (solo admin)
  getAll: (params = {}) => {
    return api.get('/vendors', { params });
  },

  // Obtener conteo de vendedores pendientes (solo admin)
  getPendingCount: () => {
    return api.get('/vendors/pending/count');
  },

  // Actualizar estado de un vendedor (solo admin)
  updateStatus: (vendorId, status) => {
    return api.patch(`/vendors/${vendorId}/status`, { status });
  },
};

