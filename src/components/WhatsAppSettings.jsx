import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { settingsService } from '../services/settingsService';
import Swal from 'sweetalert2';

const WhatsAppSettings = () => {
  const [loading, setLoading] = useState(false);
  const [whatsappNumber, setWhatsappNumber] = useState('');

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      const response = await settingsService.get('whatsapp_number');
      setWhatsappNumber(response.data.data?.value || '');
    } catch (error) {
      console.error('Error al cargar configuración:', error);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      await settingsService.update('whatsapp_number', whatsappNumber);
      await Swal.fire({
        icon: 'success',
        title: '¡Configuración actualizada!',
        text: 'El número de WhatsApp se ha actualizado exitosamente',
        confirmButtonText: 'Entendido',
        confirmButtonColor: '#a855f7',
        customClass: {
          popup: 'kawaii-card',
          confirmButton: 'kawaii-button bg-purple-pastel text-white hover:bg-purple-600',
        },
      });
    } catch (error) {
      await Swal.fire({
        icon: 'error',
        title: 'Error',
        text: error.response?.data?.message || 'Error al actualizar la configuración',
        confirmButtonText: 'Entendido',
        confirmButtonColor: '#ef4444',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="kawaii-card"
    >
      <h2 className="text-2xl font-bold text-gray-800 mb-4 font-nunito">
        📱 Configuración de WhatsApp
      </h2>
      <p className="text-gray-600 mb-6">
        Configura el número de WhatsApp global que se mostrará en los botones de contacto del menú principal y en la parte superior derecha.
      </p>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            Número de WhatsApp *
          </label>
          <input
            type="tel"
            value={whatsappNumber}
            onChange={(e) => setWhatsappNumber(e.target.value)}
            required
            className="w-full kawaii-input"
            placeholder="+51 999 999 999"
          />
          <p className="text-xs text-gray-500 mt-1">
            Este número se usará para los botones de contacto principales
          </p>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="kawaii-button bg-purple-pastel text-white hover:bg-purple-600 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
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
              <span>Guardando...</span>
            </>
          ) : (
            <>
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              <span>Guardar Configuración</span>
            </>
          )}
        </button>
      </form>
    </motion.div>
  );
};

export default WhatsAppSettings;

