import api from './api';

export const vendorService = {
  // Registrar nuevo vendedor (público)
  register: (data) => {
    return api.post('/register-vendor', data);
  },

  // Obtener vendedores aprobados (público)
  getApproved: () => {
    return api.get('/vendors/approved');
  },

  // Obtener todos los vendedores (solo admin)
  getAll: (params = {}) => {
    return api.get('/vendors', { params });
  },

  // Actualizar estado del vendedor (solo admin)
  updateStatus: (id, status) => {
    return api.patch(`/vendors/${id}/status`, { status });
  },

  // Obtener conteo de vendedores pendientes (solo admin)
  getPendingCount: () => {
    return api.get('/vendors/pending/count');
  },

  // Actualizar perfil del vendedor
  updateProfile: (data) => {
    return api.put('/vendor/profile', data);
  },

  // Subir QR code
  uploadQr: (type, file) => {
    const formData = new FormData();
    formData.append('type', type);
    formData.append('qr_image', file);
    return api.post('/vendor/upload-qr', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
  },
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

  // Actualizar datos básicos del vendedor por admin (sin email ni password)
  updateByAdmin: (vendorId, data) => {
    return api.put(`/vendors/${vendorId}`, data);
  },
};

