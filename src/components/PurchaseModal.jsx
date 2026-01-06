import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { productService } from '../services/productService';
import api from '../services/api';

const PurchaseModal = ({ product, onClose }) => {
  const [voucherFile, setVoucherFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);

  // Código QR de ejemplo (en producción, esto vendría del backend)
  const qrCodeUrl = 'https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=YAPE_PLIN_CODE_HERE';

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        setError('La imagen es demasiado grande. Máximo 5MB');
        return;
      }
      setVoucherFile(file);
      setError(null);
      
      // Crear preview
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!voucherFile) {
      setError('Por favor, sube la foto del voucher');
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const formData = new FormData();
      formData.append('product_id', product.id);
      formData.append('voucher_image', voucherFile);

      const response = await api.post('/orders', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      setSuccess(true);
      setTimeout(() => {
        onClose();
        window.location.reload();
      }, 2000);
    } catch (err) {
      setError(
        err.response?.data?.message || 
        'Error al procesar el pedido. Por favor, intenta nuevamente.'
      );
    } finally {
      setLoading(false);
    }
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat('es-PE', {
      style: 'currency',
      currency: 'PEN',
    }).format(price);
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.9 }}
          className="kawaii-card max-w-md w-full max-h-[90vh] overflow-y-auto"
        >
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-gray-800">Finalizar Compra</h2>
            <button
              onClick={onClose}
              className="text-gray-500 hover:text-gray-700 text-2xl"
            >
              ×
            </button>
          </div>

          {success ? (
            <div className="text-center py-8">
              <div className="text-6xl mb-4">✅</div>
              <p className="text-xl font-semibold text-gray-800 mb-2">
                ¡Pedido realizado exitosamente!
              </p>
              <p className="text-gray-600">
                El vendedor revisará tu pedido pronto.
              </p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Información del producto */}
              <div className="bg-pink-pastel rounded-2xl p-4">
                <h3 className="font-semibold text-gray-800 mb-2">{product.name}</h3>
                <p className="text-2xl font-bold text-purple-pastel">
                  {formatPrice(product.price)}
                </p>
              </div>

              {/* Código QR */}
              <div className="text-center">
                <p className="text-sm text-gray-600 mb-3">
                  Escanea el código QR para realizar el pago
                </p>
                <div className="bg-white p-4 rounded-2xl inline-block shadow-kawaii">
                  <img
                    src={qrCodeUrl}
                    alt="QR Code"
                    className="w-48 h-48 mx-auto"
                  />
                </div>
                <p className="text-xs text-gray-500 mt-3">
                  Yape / Plin: 999 999 999
                </p>
              </div>

              {/* Upload de voucher */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Sube la foto de tu voucher
                </label>
                <div className="space-y-3">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleFileChange}
                    className="hidden"
                    id="voucher-upload"
                  />
                  <label
                    htmlFor="voucher-upload"
                    className="kawaii-button bg-yellow-pastel text-gray-700 cursor-pointer flex items-center justify-center gap-2"
                  >
                    <span>📷</span>
                    {voucherFile ? 'Cambiar imagen' : 'Seleccionar imagen'}
                  </label>

                  {preview && (
                    <div className="mt-3">
                      <img
                        src={preview}
                        alt="Voucher preview"
                        className="w-full h-48 object-cover rounded-2xl border-2 border-pink-pastel"
                      />
                    </div>
                  )}

                  {voucherFile && (
                    <p className="text-xs text-gray-500">
                      Archivo: {voucherFile.name}
                    </p>
                  )}
                </div>
              </div>

              {error && (
                <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-2xl text-sm">
                  {error}
                </div>
              )}

              {/* Botones */}
              <div className="flex gap-3 pt-4">
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
                  className="flex-1 kawaii-button bg-purple-pastel text-white hover:bg-purple-400"
                  disabled={loading || !voucherFile}
                >
                  {loading ? 'Procesando...' : 'Confirmar Pedido'}
                </button>
              </div>
            </form>
          )}
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

export default PurchaseModal;

