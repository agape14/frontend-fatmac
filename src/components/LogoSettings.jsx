import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { settingsService } from '../services/settingsService';
import Swal from 'sweetalert2';

const LogoSettings = () => {
  const [loading, setLoading] = useState(false);
  const [logoUrl, setLogoUrl] = useState('');
  const [preview, setPreview] = useState(null);
  const [file, setFile] = useState(null);

  useEffect(() => {
    loadLogo();
  }, []);

  const loadLogo = async () => {
    try {
      const response = await settingsService.get('logo_url');
      const url = response.data.data?.value || '';
      setLogoUrl(url);
      setPreview(url || '/logo-fatmac.png');
    } catch (error) {
      console.error('Error al cargar logo:', error);
      setPreview('/logo-fatmac.png');
    }
  };

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile) {
      // Validar tipo de archivo
      if (!selectedFile.type.startsWith('image/')) {
        Swal.fire({
          icon: 'error',
          title: 'Error',
          text: 'El archivo debe ser una imagen',
          confirmButtonText: 'Entendido',
          confirmButtonColor: '#ef4444',
        });
        return;
      }

      // Validar tamaño (2MB)
      if (selectedFile.size > 2 * 1024 * 1024) {
        Swal.fire({
          icon: 'error',
          title: 'Error',
          text: 'La imagen no debe ser mayor a 2MB',
          confirmButtonText: 'Entendido',
          confirmButtonColor: '#ef4444',
        });
        return;
      }

      setFile(selectedFile);
      
      // Crear preview
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreview(reader.result);
      };
      reader.readAsDataURL(selectedFile);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!file) {
      Swal.fire({
        icon: 'warning',
        title: 'Advertencia',
        text: 'Por favor selecciona una imagen para el logo',
        confirmButtonText: 'Entendido',
        confirmButtonColor: '#f59e0b',
      });
      return;
    }

    setLoading(true);

    try {
      const response = await settingsService.uploadLogo(file);
      setLogoUrl(response.data.data.url);
      setFile(null);
      
      await Swal.fire({
        icon: 'success',
        title: '¡Logo actualizado!',
        text: 'El logo se ha actualizado exitosamente',
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
        text: error.response?.data?.message || 'Error al actualizar el logo',
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
        🖼️ Configuración del Logo
      </h2>
      <p className="text-gray-600 mb-6">
        Cambia la imagen del logo que se muestra en el header del sitio.
      </p>

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Preview del logo actual */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            Vista Previa del Logo
          </label>
          <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-xl border-2 border-dashed border-gray-300">
            {preview && (
              <img
                src={preview}
                alt="Preview del logo"
                className="h-20 w-auto object-contain"
                onError={(e) => {
                  e.target.src = '/logo-fatmac.png';
                }}
              />
            )}
            <div className="flex-1">
              <p className="text-sm text-gray-600">
                {file ? 'Nueva imagen seleccionada' : 'Logo actual'}
              </p>
              {logoUrl && !file && (
                <a
                  href={logoUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs text-purple-pastel hover:underline"
                >
                  Ver logo actual →
                </a>
              )}
            </div>
          </div>
        </div>

        {/* Input de archivo */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            Seleccionar Nueva Imagen *
          </label>
          <input
            type="file"
            accept="image/jpeg,image/png,image/jpg,image/svg+xml"
            onChange={handleFileChange}
            disabled={loading}
            className="w-full kawaii-input"
          />
          <p className="text-xs text-gray-500 mt-1">
            Formatos permitidos: JPEG, PNG, JPG, SVG. Tamaño máximo: 2MB
          </p>
        </div>

        <button
          type="submit"
          disabled={loading || !file}
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
              <span>Subiendo...</span>
            </>
          ) : (
            <>
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
              </svg>
              <span>Subir Logo</span>
            </>
          )}
        </button>
      </form>
    </motion.div>
  );
};

export default LogoSettings;

