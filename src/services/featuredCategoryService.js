import api from './api';

export const featuredCategoryService = {
  getAll: () => {
    return api.get('/featured-categories');
  },
};

