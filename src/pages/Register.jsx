import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import Swal from 'sweetalert2';

const Register = () => {
  const navigate = useNavigate();
  const { register } = useAuth();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    password_confirmation: '',
    phone_number: '',
    role: 'customer',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [errors, setErrors] = useState({});

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setErrors({});

    const result = await register(formData);

    if (result.success) {
      // Si es vendor y está pendiente, mostrar mensaje especial
      if (result.user.role === 'vendor' && result.user.status === 'pending') {
        await Swal.fire({
          icon: 'info',
          title: 'Cuenta pendiente',
          html: `
            <p style="margin-bottom: 15px;">Tu cuenta está pendiente de aprobación.</p>
            <p style="color: #6b7280; font-size: 14px;">Recibirás una notificación cuando sea aprobada.</p>
          `,
          confirmButtonText: 'Entendido',
          confirmButtonColor: '#a855f7',
          customClass: {
            popup: 'kawaii-card',
            confirmButton: 'kawaii-button bg-purple-pastel text-white hover:bg-purple-600',
          },
        });
        navigate('/');
      } else if (result.user.role === 'vendor') {
        navigate('/dashboard');
      } else {
        navigate('/');
      }
    } else {
      setError(result.message || 'Error al registrar usuario');
      if (result.errors) {
        setErrors(result.errors);
      }
    }

    setLoading(false);
  };

  return (
    <div className="min-h-screen py-16 bg-gradient-to-br from-pink-pastel via-purple-pastel to-yellow-pastel flex items-center justify-center">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md"
      >
        <div className="kawaii-card">
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold text-gray-800 mb-2 font-nunito">
              Crear Cuenta
            </h1>
            <p className="text-gray-600">
              Únete a la comunidad FATMAC
            </p>
          </div>

          {error && (
            <div className="mb-6 p-4 bg-red-100 border-2 border-red-300 rounded-3xl text-red-700 text-sm">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
                Nombre Completo
              </label>
              <input
                id="name"
                type="text"
                required
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className={`kawaii-input w-full ${errors.name ? 'border-red-300' : ''}`}
                placeholder="Tu nombre"
              />
              {errors.name && (
                <p className="mt-1 text-sm text-red-600">{errors.name[0]}</p>
              )}
            </div>

            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                Correo Electrónico
              </label>
              <input
                id="email"
                type="email"
                required
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className={`kawaii-input w-full ${errors.email ? 'border-red-300' : ''}`}
                placeholder="tu@email.com"
              />
              {errors.email && (
                <p className="mt-1 text-sm text-red-600">{errors.email[0]}</p>
              )}
            </div>

            <div>
              <label htmlFor="phone_number" className="block text-sm font-medium text-gray-700 mb-2">
                Teléfono (Opcional)
              </label>
              <input
                id="phone_number"
                type="tel"
                value={formData.phone_number}
                onChange={(e) => setFormData({ ...formData, phone_number: e.target.value })}
                className="kawaii-input w-full"
                placeholder="+51 999 999 999"
              />
            </div>

            <div>
              <label htmlFor="role" className="block text-sm font-medium text-gray-700 mb-2">
                Tipo de Cuenta
              </label>
              <select
                id="role"
                value={formData.role}
                onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                className="kawaii-input w-full"
              >
                <option value="customer">Cliente</option>
                <option value="vendor">Vendedor</option>
              </select>
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
                Contraseña
              </label>
              <input
                id="password"
                type="password"
                required
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                className={`kawaii-input w-full ${errors.password ? 'border-red-300' : ''}`}
                placeholder="Mínimo 8 caracteres"
              />
              {errors.password && (
                <p className="mt-1 text-sm text-red-600">{errors.password[0]}</p>
              )}
            </div>

            <div>
              <label htmlFor="password_confirmation" className="block text-sm font-medium text-gray-700 mb-2">
                Confirmar Contraseña
              </label>
              <input
                id="password_confirmation"
                type="password"
                required
                value={formData.password_confirmation}
                onChange={(e) => setFormData({ ...formData, password_confirmation: e.target.value })}
                className="kawaii-input w-full"
                placeholder="Repite tu contraseña"
              />
            </div>

            <motion.button
              type="submit"
              disabled={loading}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="w-full kawaii-button bg-gradient-to-r from-purple-pastel to-pink-pastel text-white hover:from-purple-400 hover:to-pink-400 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Creando cuenta...' : 'Crear Cuenta'}
            </motion.button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-gray-600">
              ¿Ya tienes una cuenta?{' '}
              <Link to="/login" className="text-purple-pastel font-semibold hover:underline">
                Inicia sesión aquí
              </Link>
            </p>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default Register;

