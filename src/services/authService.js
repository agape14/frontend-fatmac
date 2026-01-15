import api from './api';

export const authService = {
  // Registro de usuario
  register: async (data) => {
    // No necesitamos token CSRF para rutas API cuando usamos tokens Bearer
    return api.post('/register', data);
  },

  // Login de usuario
  login: async (data) => {
    // No necesitamos token CSRF para rutas API cuando usamos tokens Bearer
    return api.post('/login', data);
  },

  // Logout de usuario
  logout: () => {
    return api.post('/logout');
  },

  // Obtener usuario autenticado
  getUser: () => {
    return api.get('/user');
  },

  // Actualizar perfil
  updateProfile: (data) => {
    return api.put('/user/profile', data);
  },

  // Cambiar contraseña
  changePassword: (data) => {
    return api.put('/user/password', data);
  },
};

