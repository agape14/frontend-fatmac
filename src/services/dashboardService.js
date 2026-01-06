import api from './api';

export const dashboardService = {
  // Obtener estadísticas del dashboard
  getStats: () => {
    return api.get('/dashboard/stats');
  },
};

