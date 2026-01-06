import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { vendorService } from '../services/vendorService';
import Swal from 'sweetalert2';

const VendorRegistrationModal = ({ isOpen, onClose }) => {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    password_confirmation: '',
    phone_number: '',
    whatsapp_number: '',
    business_description: '',
    business_address: '',
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await vendorService.register(formData);
      
      await Swal.fire({
        icon: 'success',
        title: '¡Registro Exitoso!',
        html: `
          <p style="margin-bottom: 15px;">Tu solicitud ha sido registrada correctamente.</p>
          <div style="margin-top: 15px; padding: 15px; background: #f0f9ff; border-radius: 8px; text-align: left;">
            <strong style="display: block; margin-bottom: 10px;">📧 Estado de tu solicitud:</strong>
            <p style="color: #6b7280; margin: 0;">
              Tu cuenta está en <strong>proceso de evaluación</strong>. Te notificaremos por correo electrónico cuando sea aprobada.
            </p>
          </div>
        `,
        confirmButtonText: 'Entendido',
        confirmButtonColor: '#a855f7',
        customClass: {
          popup: 'kawaii-card',
          confirmButton: 'kawaii-button bg-purple-pastel text-white hover:bg-purple-600',
        },
      });

      // Resetear formulario y cerrar
      setFormData({
        name: '',
        email: '',
        password: '',
        password_confirmation: '',
        phone_number: '',
        whatsapp_number: '',
        business_description: '',
        business_address: '',
      });
      onClose();
    } catch (error) {
      console.error('Error al registrar vendedor:', error);
      
      let errorMessage = 'Error al registrar. Por favor, intenta nuevamente.';
      if (error.response?.data?.errors) {
        const errors = error.response.data.errors;
        
        // Mapeo de nombres de campos a español
        const fieldNames = {
          name: 'Nombre',
          email: 'Correo electrónico',
          password: 'Contraseña',
          password_confirmation: 'Confirmar contraseña',
          phone_number: 'Teléfono',
          whatsapp_number: 'WhatsApp',
          business_description: 'Descripción del negocio',
          business_address: 'Dirección del negocio',
        };
        
        const errorList = Object.entries(errors)
          .map(([field, messages]) => {
            const fieldName = fieldNames[field] || field.replace(/_/g, ' ');
            const messagesArray = Array.isArray(messages) ? messages : [messages];
            const messagesText = messagesArray.join(', ');
            return `<div style="margin-bottom: 8px;"><strong style="color: #dc2626;">${fieldName}:</strong><br><span style="color: #6b7280; margin-left: 12px;">${messagesText}</span></div>`;
          })
          .join('');
        errorMessage = `<div style="text-align: left; padding: 10px;">${errorList}</div>`;
      } else if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      }

      await Swal.fire({
        icon: 'error',
        title: 'Error al registrar',
        html: errorMessage,
        confirmButtonText: 'Entendido',
        confirmButtonColor: '#ef4444',
        customClass: {
          popup: 'kawaii-card',
          confirmButton: 'kawaii-button bg-red-500 text-white hover:bg-red-600',
        },
      });
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center">
        {/* Overlay */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="absolute inset-0 bg-black/50"
        />

        {/* Modal */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: 20 }}
          className="relative bg-white rounded-3xl shadow-2xl max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto"
        >
          {/* Header */}
          <div className="sticky top-0 bg-gradient-to-r from-purple-pastel to-pink-pastel p-6 rounded-t-3xl">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-3xl font-bold text-white font-nunito">
                  🛍️ Regístrate como Vendedor
                </h2>
                <p className="text-white/90 mt-1">
                  Únete a nuestra plataforma y vende tus productos
                </p>
              </div>
              <button
                onClick={onClose}
                className="text-white hover:bg-white/20 rounded-full p-2 transition-colors"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="p-6 space-y-4">
            {/* Nombre */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Nombre completo *
              </label>
              <input
                type="text"
                required
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full kawaii-input"
                placeholder="Ingresa tu nombre completo"
              />
            </div>

            {/* Email */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Email *
              </label>
              <input
                type="email"
                required
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="w-full kawaii-input"
                placeholder="tu@email.com"
              />
            </div>

            {/* Contraseña */}
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Contraseña *
                </label>
                <input
                  type="password"
                  required
                  minLength={8}
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  className="w-full kawaii-input"
                  placeholder="Mínimo 8 caracteres"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Confirmar contraseña *
                </label>
                <input
                  type="password"
                  required
                  minLength={8}
                  value={formData.password_confirmation}
                  onChange={(e) => setFormData({ ...formData, password_confirmation: e.target.value })}
                  className="w-full kawaii-input"
                  placeholder="Repite la contraseña"
                />
              </div>
            </div>

            {/* Teléfonos */}
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Teléfono *
                </label>
                <input
                  type="tel"
                  required
                  value={formData.phone_number}
                  onChange={(e) => setFormData({ ...formData, phone_number: e.target.value })}
                  className="w-full kawaii-input"
                  placeholder="+51 999 999 999"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  WhatsApp (opcional)
                </label>
                <input
                  type="tel"
                  value={formData.whatsapp_number}
                  onChange={(e) => setFormData({ ...formData, whatsapp_number: e.target.value })}
                  className="w-full kawaii-input"
                  placeholder="+51 999 999 999"
                />
              </div>
            </div>

            {/* Dirección del negocio */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Dirección del negocio (opcional)
              </label>
              <input
                type="text"
                value={formData.business_address}
                onChange={(e) => setFormData({ ...formData, business_address: e.target.value })}
                className="w-full kawaii-input"
                placeholder="Dirección donde se encuentra tu negocio"
              />
            </div>

            {/* Descripción del negocio */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Descripción del negocio (opcional)
              </label>
              <textarea
                value={formData.business_description}
                onChange={(e) => setFormData({ ...formData, business_description: e.target.value })}
                className="w-full kawaii-input min-h-[100px]"
                placeholder="Cuéntanos sobre tu negocio..."
              />
            </div>

            {/* Info */}
            <div className="bg-blue-50 border-2 border-blue-200 rounded-xl p-4">
              <p className="text-sm text-blue-700">
                <strong>💡 Importante:</strong> Tu solicitud será revisada por nuestro equipo. Te notificaremos por correo electrónico cuando sea aprobada.
              </p>
            </div>

            {/* Botones */}
            <div className="flex gap-4 pt-4">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 kawaii-button bg-gray-200 text-gray-700 hover:bg-gray-300"
                disabled={loading}
              >
                Cancelar
              </button>
              <button
                type="submit"
                disabled={loading}
                className="flex-1 kawaii-button bg-purple-pastel text-white hover:bg-purple-600 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {loading ? (
                  <>
                    <motion.svg
                      animate={{ rotate: 360 }}
                      transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                      className="w-5 h-5"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                    </motion.svg>
                    <span>Registrando...</span>
                  </>
                ) : (
                  <>
                    <span>Registrarse como Vendedor</span>
                  </>
                )}
              </button>
            </div>
          </form>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

export default VendorRegistrationModal;

