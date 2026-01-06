import api from './api';

export const promotionalBannerService = {
  getAll: () => {
    return api.get('/promotional-banners');
  },
};

