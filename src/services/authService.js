import api from './api';
import axios from 'axios';

// Función para obtener el token CSRF de Sanctum
const getCsrfToken = async () => {
  const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:8000/api';
  const baseUrl = apiUrl.replace('/api', '');
  
  // Crear una instancia de axios para la petición CSRF sin el prefijo /api
  const csrfAxios = axios.create({
    baseURL: baseUrl,
    withCredentials: true,
  });
  
  return csrfAxios.get('/sanctum/csrf-cookie');
};

export const authService = {
  // Registro de usuario
  register: async (data) => {
    // Obtener token CSRF antes del registro
    await getCsrfToken();
    return api.post('/register', data);
  },

  // Login de usuario
  login: async (data) => {
    // Obtener token CSRF antes del login
    await getCsrfToken();
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

