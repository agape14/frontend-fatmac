import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import { authService } from '../services/authService';
import { vendorService } from '../services/vendorService';
import PrivateRoute from '../components/PrivateRoute';
import Swal from 'sweetalert2';

const Profile = () => {
  const { user, setUser, isVendor } = useAuth();
  const [loading, setLoading] = useState(false);
  const [loadingQr, setLoadingQr] = useState({ yape: false, plin: false });
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone_number: '',
    whatsapp_number: '',
    business_description: '',
    business_address: '',
  });

  useEffect(() => {
    if (user) {
      setFormData({
        name: user.name || '',
        email: user.email || '',
        phone_number: user.phone_number || '',
        whatsapp_number: user.whatsapp_number || '',
        business_description: user.business_description || '',
        business_address: user.business_address || '',
      });
    }
  }, [user]);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      let response;
      if (isVendor) {
        // Si es vendedor, actualizar perfil del vendedor
        response = await vendorService.updateProfile(formData);
      } else {
        response = await authService.updateProfile(formData);
      }
      
      // Actualizar el usuario en el contexto
      setUser(response.data.data);

      await Swal.fire({
        icon: 'success',
        title: '¡Perfil actualizado!',
        text: 'Tu perfil se ha actualizado exitosamente',
        confirmButtonText: 'Entendido',
        confirmButtonColor: '#a855f7',
        customClass: {
          popup: 'kawaii-card',
          confirmButton: 'kawaii-button bg-purple-pastel text-white hover:bg-purple-600',
        },
      });
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'Error al actualizar el perfil';
      const errors = error.response?.data?.errors;

      // Mapeo de nombres de campos a español
      const fieldNames = {
        name: 'Nombre',
        email: 'Correo electrónico',
        phone_number: 'Teléfono',
        whatsapp_number: 'WhatsApp',
        business_description: 'Descripción del negocio',
        business_address: 'Dirección del negocio',
      };
      
      let errorHtml = `<p style="margin-bottom: 10px;">${errorMessage}</p>`;
      if (errors) {
        const errorList = Object.entries(errors)
          .map(([field, messages]) => {
            const fieldName = fieldNames[field] || field.replace(/_/g, ' ');
            const messagesArray = Array.isArray(messages) ? messages : [messages];
            const messagesText = messagesArray.join(', ');
            return `<div style="margin-bottom: 8px;"><strong style="color: #dc2626;">${fieldName}:</strong><br><span style="color: #6b7280; margin-left: 12px;">${messagesText}</span></div>`;
          })
          .join('');
        errorHtml = `<div style="text-align: left; padding: 10px;">${errorHtml}${errorList}</div>`;
      }

      await Swal.fire({
        icon: 'error',
        title: 'Error al actualizar',
        html: errorHtml,
        confirmButtonText: 'Entendido',
        confirmButtonColor: '#a855f7',
        customClass: {
          popup: 'kawaii-card',
          confirmButton: 'kawaii-button bg-purple-pastel text-white hover:bg-purple-600',
        },
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <PrivateRoute>
      <div className="min-h-screen py-12 bg-gradient-to-br from-pink-pastel/20 via-purple-pastel/20 to-yellow-pastel/20">
        <div className="container mx-auto px-4 max-w-2xl">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8"
          >
            <h1 className="text-4xl font-bold text-gray-800 mb-2 font-nunito">
              👤 Mi Perfil
            </h1>
            <p className="text-gray-600">Actualiza tu información personal</p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="kawaii-card"
          >
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label htmlFor="name" className="block text-sm font-semibold text-gray-700 mb-2">
                  Nombre Completo
                </label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  required
                  className="w-full kawaii-input"
                  placeholder="Ingresa tu nombre completo"
                />
              </div>

              <div>
                <label htmlFor="email" className="block text-sm font-semibold text-gray-700 mb-2">
                  Correo Electrónico
                </label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  required
                  className="w-full kawaii-input"
                  placeholder="tu@email.com"
                />
              </div>

              <div>
                <label htmlFor="phone_number" className="block text-sm font-semibold text-gray-700 mb-2">
                  Teléfono
                </label>
                <input
                  type="tel"
                  id="phone_number"
                  name="phone_number"
                  value={formData.phone_number}
                  onChange={handleChange}
                  className="w-full kawaii-input"
                  placeholder="999999999"
                />
              </div>

              {/* Campos adicionales para vendedores */}
              {isVendor && (
                <>
                  <div>
                    <label htmlFor="whatsapp_number" className="block text-sm font-semibold text-gray-700 mb-2">
                      WhatsApp
                    </label>
                    <input
                      type="tel"
                      id="whatsapp_number"
                      name="whatsapp_number"
                      value={formData.whatsapp_number}
                      onChange={handleChange}
                      className="w-full kawaii-input"
                      placeholder="+51 999 999 999"
                    />
                  </div>

                  <div>
                    <label htmlFor="business_address" className="block text-sm font-semibold text-gray-700 mb-2">
                      Dirección del Negocio
                    </label>
                    <input
                      type="text"
                      id="business_address"
                      name="business_address"
                      value={formData.business_address}
                      onChange={handleChange}
                      className="w-full kawaii-input"
                      placeholder="Dirección donde se encuentra tu negocio"
                    />
                  </div>

                  <div>
                    <label htmlFor="business_description" className="block text-sm font-semibold text-gray-700 mb-2">
                      Descripción del Negocio
                    </label>
                    <textarea
                      id="business_description"
                      name="business_description"
                      value={formData.business_description}
                      onChange={handleChange}
                      className="w-full kawaii-input min-h-[100px]"
                      placeholder="Cuéntanos sobre tu negocio..."
                    />
                  </div>

                  {/* Carga de QR Codes */}
                  <div className="border-t border-gray-200 pt-6 mt-6">
                    <h3 className="text-lg font-semibold text-gray-800 mb-4">📱 Códigos QR para Pagos</h3>
                    
                    <div className="space-y-4">
                      {/* Yape QR */}
                      <div className="space-y-2">
                        <label className="block text-sm font-semibold text-gray-700">
                          QR Yape
                        </label>
                        {user?.yape_qr && (
                          <div className="mb-2">
                            <img 
                              src={user.yape_qr.startsWith('http') ? user.yape_qr : `${import.meta.env.VITE_API_URL}/storage/${user.yape_qr}`} 
                              alt="QR Yape" 
                              className="w-32 h-32 object-contain border rounded-lg" 
                              onError={(e) => {
                                e.target.style.display = 'none';
                              }}
                            />
                          </div>
                        )}
                        <input
                          type="file"
                          accept="image/*"
                          onChange={async (e) => {
                            const file = e.target.files[0];
                            if (!file) return;
                            setLoadingQr({ ...loadingQr, yape: true });
                            try {
                              const response = await vendorService.uploadQr('yape', file);
                              setUser({ ...user, yape_qr: response.data.data.qr_url });
                              await Swal.fire({
                                icon: 'success',
                                title: 'QR actualizado',
                                text: 'Código QR de Yape actualizado exitosamente',
                                timer: 2000,
                                showConfirmButton: false,
                              });
                            } catch (error) {
                              await Swal.fire({
                                icon: 'error',
                                title: 'Error',
                                text: error.response?.data?.message || 'Error al subir QR',
                              });
                            } finally {
                              setLoadingQr({ ...loadingQr, yape: false });
                            }
                          }}
                          disabled={loadingQr.yape}
                          className="w-full kawaii-input"
                        />
                      </div>

                      {/* Plin QR */}
                      <div className="space-y-2">
                        <label className="block text-sm font-semibold text-gray-700">
                          QR Plin
                        </label>
                        {user?.plin_qr && (
                          <div className="mb-2">
                            <img 
                              src={user.plin_qr.startsWith('http') ? user.plin_qr : `${import.meta.env.VITE_API_URL}/storage/${user.plin_qr}`} 
                              alt="QR Plin" 
                              className="w-32 h-32 object-contain border rounded-lg" 
                              onError={(e) => {
                                e.target.style.display = 'none';
                              }}
                            />
                          </div>
                        )}
                        <input
                          type="file"
                          accept="image/*"
                          onChange={async (e) => {
                            const file = e.target.files[0];
                            if (!file) return;
                            setLoadingQr({ ...loadingQr, plin: true });
                            try {
                              const response = await vendorService.uploadQr('plin', file);
                              setUser({ ...user, plin_qr: response.data.data.qr_url });
                              await Swal.fire({
                                icon: 'success',
                                title: 'QR actualizado',
                                text: 'Código QR de Plin actualizado exitosamente',
                                timer: 2000,
                                showConfirmButton: false,
                              });
                            } catch (error) {
                              await Swal.fire({
                                icon: 'error',
                                title: 'Error',
                                text: error.response?.data?.message || 'Error al subir QR',
                              });
                            } finally {
                              setLoadingQr({ ...loadingQr, plin: false });
                            }
                          }}
                          disabled={loadingQr.plin}
                          className="w-full kawaii-input"
                        />
                      </div>
                    </div>
                  </div>
                </>
              )}

              <div className="pt-4">
                <motion.button
                  type="submit"
                  disabled={loading}
                  whileHover={{ scale: loading ? 1 : 1.02 }}
                  whileTap={{ scale: loading ? 1 : 0.98 }}
                  className="w-full kawaii-button bg-purple-pastel text-white hover:bg-purple-600 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {loading ? (
                    <>
                      <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      <span>Guardando...</span>
                    </>
                  ) : (
                    <>
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      <span>Guardar Cambios</span>
                    </>
                  )}
                </motion.button>
              </div>
            </form>
          </motion.div>
        </div>
      </div>
    </PrivateRoute>
  );
};

export default Profile;

