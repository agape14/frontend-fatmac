import api from './api';

export const settingsService = {
  // Obtener una configuración por key (público)
  get: (key) => {
    return api.get(`/settings/${key}`);
  },

  // Obtener todas las configuraciones (solo admin)
  getAll: () => {
    return api.get('/settings');
  },

  // Actualizar una configuración (solo admin)
  update: (key, value) => {
    return api.put(`/settings/${key}`, { value });
  },

  // Subir logo (solo admin)
  uploadLogo: (logoFile) => {
    const formData = new FormData();
    formData.append('logo', logoFile);
    return api.post('/settings/upload-logo', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
  },
};

