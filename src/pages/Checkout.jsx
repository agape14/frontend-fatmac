import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { orderService } from '../services/orderService';
import { authService } from '../services/authService';
import { settingsService } from '../services/settingsService';
import Swal from 'sweetalert2';

// Checkout público - no requiere autenticación
// El cliente puede completar la compra sin registrarse

const Checkout = () => {
  const navigate = useNavigate();
  const { cart, clearCart, getCartTotal } = useCart();
  const { login, isAuthenticated, user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    address: '',
    payment_method: 'yape',
  });
  const [voucherFile, setVoucherFile] = useState(null);
  const [voucherPreview, setVoucherPreview] = useState(null);
  const [qrUrl, setQrUrl] = useState(null);
  const [loadingQr, setLoadingQr] = useState(false);

  useEffect(() => {
    // Scroll al inicio al cargar
    window.scrollTo({ top: 0, behavior: 'smooth' });
    
    // Si el carrito está vacío, redirigir
    if (cart.length === 0) {
      navigate('/cart');
      return;
    }
  }, [cart.length, navigate]);

  // Cargar QR cuando cambie el método de pago o el carrito
  useEffect(() => {
    if (cart.length > 0) {
      loadVendorQr();
    }
  }, [formData.payment_method]);

  const loadVendorQr = async () => {
    if (cart.length === 0) return;

    // Obtener el vendedor del primer producto
    const vendorId = cart[0]?.vendor?.id;
    if (!vendorId) return;

    setLoadingQr(true);
    try {
      const response = await orderService.getVendorQr(vendorId, formData.payment_method);
      setQrUrl(response.data.data?.qr_url || null);
    } catch (error) {
      console.error('Error al cargar QR:', error);
      setQrUrl(null);
    } finally {
      setLoadingQr(false);
    }
  };

  // Recargar QR cuando cambie el método de pago
  useEffect(() => {
    loadVendorQr();
  }, [formData.payment_method]);

  // Pre-llenar formulario con datos del usuario si está autenticado
  useEffect(() => {
    const loadUserData = async () => {
      if (isAuthenticated && user) {
        // Cargar datos básicos del usuario
        setFormData(prev => ({
          ...prev,
          name: user.name || '',
          email: user.email || '',
          phone: user.phone_number || '',
          payment_method: 'yape',
        }));

        // Cargar última dirección usada
        try {
          const response = await orderService.getLastAddress();
          if (response.data.data?.address) {
            setFormData(prev => ({
              ...prev,
              address: response.data.data.address,
            }));
          }
        } catch (error) {
          console.error('Error al cargar última dirección:', error);
          // Si hay error, simplemente no cargar la dirección
        }
      }
    };

    loadUserData();
  }, [isAuthenticated, user]);

  const formatPrice = (price) => {
    return new Intl.NumberFormat('es-PE', {
      style: 'currency',
      currency: 'PEN',
    }).format(price);
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setVoucherFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setVoucherPreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validar que se haya subido el voucher
    if (!voucherFile) {
      await Swal.fire({
        icon: 'warning',
        title: 'Comprobante requerido',
        text: 'Por favor, sube el comprobante de pago antes de continuar.',
        confirmButtonText: 'Entendido',
        confirmButtonColor: '#a855f7',
      });
      return;
    }

    setLoading(true);

    try {
      // Crear un solo pedido con todos los productos del carrito
      const formDataToSend = new FormData();
      
      // Agregar todos los productos como array JSON
      const products = cart.map(item => ({
        product_id: item.id,
        quantity: item.quantity || 1,
      }));
      formDataToSend.append('products', JSON.stringify(products));
      
      // Datos del cliente
      formDataToSend.append('customer_name', formData.name);
      formDataToSend.append('customer_email', formData.email);
      formDataToSend.append('customer_phone', formData.phone);
      formDataToSend.append('customer_address', formData.address);
      formDataToSend.append('payment_method', formData.payment_method);
      
      // Adjuntar el voucher
      formDataToSend.append('voucher_image', voucherFile);

      const response = await orderService.create(formDataToSend);
      const userCredentials = response.data.user_credentials;

      // Si se creó un nuevo usuario y no está autenticado, hacer login automático
      if (userCredentials && !isAuthenticated) {
        const { email, password } = userCredentials;
        
        try {
          // Hacer login automático con las credenciales generadas
          const loginResult = await login(email, password);
          
          if (loginResult.success) {
            // Limpiar carrito después de crear los pedidos
            clearCart();
            
            // Mostrar mensaje de éxito con información de la cuenta
            const result = await Swal.fire({
              icon: 'success',
              title: '¡Pedido confirmado!',
              html: `
                <p style="margin-bottom: 15px;">Tu pedido ha sido recibido y está siendo procesado.</p>
                <div style="margin-top: 15px; padding: 15px; background: #f0f9ff; border-radius: 8px; text-align: left;">
                  <strong style="display: block; margin-bottom: 10px;">📧 Se ha creado una cuenta para ti:</strong>
                  <div style="margin-bottom: 8px;"><strong>Email:</strong> ${email}</div>
                  <div style="margin-bottom: 8px;"><strong>Contraseña:</strong> ${password}</div>
                  <small style="color: #6b7280; display: block; margin-top: 10px;">
                    ⚠️ Se ha enviado esta información a tu correo. Deberás cambiar la contraseña al ingresar por primera vez.
                  </small>
                </div>
              `,
              confirmButtonText: 'Ver Mis Pedidos',
              confirmButtonColor: '#a855f7',
              customClass: {
                popup: 'kawaii-card',
                confirmButton: 'kawaii-button bg-purple-pastel text-white hover:bg-purple-600',
              },
            });
            
            // Redirigir solo cuando el usuario presione el botón
            if (result.isConfirmed) {
              navigate('/my-orders');
            }
            return; // Salir temprano para evitar el código de abajo
          }
        } catch (loginError) {
          console.error('Error en login automático:', loginError);
          // Continuar con el flujo normal si el login falla
        }
      }

      // Si no se creó usuario nuevo o el login automático falló, mostrar mensaje normal
      clearCart();
      
      const result = await Swal.fire({
        icon: 'success',
        title: '¡Pedido confirmado!',
        text: 'Tu pedido ha sido recibido y está siendo procesado. Te contactaremos pronto.',
        confirmButtonText: isAuthenticated ? 'Ver Mis Pedidos' : 'Continuar',
        confirmButtonColor: '#a855f7',
        customClass: {
          popup: 'kawaii-card',
          confirmButton: 'kawaii-button bg-purple-pastel text-white hover:bg-purple-600',
        },
      });
      
      // Redirigir cuando el usuario presione el botón
      if (result.isConfirmed) {
        if (isAuthenticated) {
          navigate('/my-orders');
        } else {
          navigate('/checkout/success');
        }
      }
    } catch (error) {
      console.error('Error al procesar pedido:', error);
      
      // Si el error indica que requiere login (correo existente)
      if (error.response?.data?.requires_login) {
        const result = await Swal.fire({
          icon: 'info',
          title: 'Correo ya registrado',
          html: `
            <p style="margin-bottom: 15px;">Este correo electrónico ya está registrado en nuestro sistema.</p>
            <p style="margin-bottom: 15px; color: #6b7280;">Por favor, inicia sesión para continuar con tu pedido.</p>
          `,
          showCancelButton: true,
          confirmButtonText: 'Iniciar Sesión',
          cancelButtonText: 'Cancelar',
          confirmButtonColor: '#a855f7',
          cancelButtonColor: '#6b7280',
          customClass: {
            popup: 'kawaii-card',
            confirmButton: 'kawaii-button bg-purple-pastel text-white hover:bg-purple-600',
          },
        });

        if (result.isConfirmed) {
          navigate('/login', { state: { from: { pathname: '/checkout' } } });
        }
        setLoading(false);
        return;
      }
      
      // Extraer mensajes de error del backend
      let errorMessage = 'Error al procesar el pedido. Por favor, intenta nuevamente.';
      let errorDetails = [];

      if (error.response?.data?.errors) {
        // Si hay errores de validación, formatearlos
        const errors = error.response.data.errors;
        errorDetails = Object.entries(errors)
          .map(([field, messages]) => {
            const fieldName = field === 'voucher_image' ? 'Comprobante de pago' :
                            field === 'customer_name' ? 'Nombre' :
                            field === 'customer_email' ? 'Email' :
                            field === 'customer_phone' ? 'Teléfono' :
                            field === 'customer_address' ? 'Dirección' :
                            field === 'payment_method' ? 'Método de pago' :
                            field === 'product_id' ? 'Producto' :
                            field === 'products' ? 'Productos' : field;
            
            // Traducir mensajes comunes al español
            const translatedMessages = Array.isArray(messages) 
              ? messages.map(msg => {
                  // Traducir mensajes comunes
                  if (msg.includes('must not be greater than')) {
                    const match = msg.match(/must not be greater than (\d+) kilobytes/);
                    if (match) {
                      const sizeMB = (parseInt(match[1]) / 1024).toFixed(1);
                      return `El archivo no debe ser mayor a ${sizeMB} MB`;
                    }
                  }
                  if (msg.includes('required')) {
                    return 'Este campo es obligatorio';
                  }
                  if (msg.includes('must be an image')) {
                    return 'El archivo debe ser una imagen';
                  }
                  if (msg.includes('must be a file of type')) {
                    return 'El archivo debe ser una imagen (jpeg, png, jpg, gif)';
                  }
                  if (msg.includes('must be a valid email')) {
                    return 'Debe ser un email válido';
                  }
                  if (msg.includes('must be at least')) {
                    return 'El valor es demasiado pequeño';
                  }
                  return msg;
                })
              : [messages];
            
            return {
              field: fieldName,
              messages: translatedMessages
            };
          });
        errorMessage = 'Por favor, corrige los siguientes errores:';
      } else if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      }

      // Construir HTML para los errores
      let errorHtml = `<p style="margin-bottom: 15px; font-weight: 600;">${errorMessage}</p>`;
      
      if (errorDetails.length > 0) {
        errorHtml += '<div style="text-align: left; background: #f8f9fa; padding: 15px; border-radius: 8px; margin-top: 10px;">';
        errorDetails.forEach(({ field, messages }) => {
          errorHtml += `<div style="margin-bottom: 10px;">`;
          errorHtml += `<strong style="color: #dc2626;">${field}:</strong>`;
          errorHtml += `<ul style="margin: 5px 0 0 20px; padding: 0;">`;
          messages.forEach(msg => {
            errorHtml += `<li style="color: #6b7280; margin-bottom: 5px;">${msg}</li>`;
          });
          errorHtml += `</ul></div>`;
        });
        errorHtml += '</div>';
      }

      await Swal.fire({
        icon: 'error',
        title: 'Error al procesar el pedido',
        html: errorHtml,
        confirmButtonText: 'Entendido',
        confirmButtonColor: '#ef4444',
        width: '500px',
        customClass: {
          popup: 'swal2-popup-custom',
          title: 'swal2-title-custom',
          htmlContainer: 'swal2-html-container-custom'
        }
      });
    } finally {
      setLoading(false);
    }
  };

  if (cart.length === 0) {
    return null; // El useEffect redirigirá
  }

  return (
    <div className="min-h-screen py-12 bg-blue-50">
      <div className="container mx-auto px-4 max-w-4xl">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <h1 className="text-4xl font-bold text-gray-800 mb-8 font-nunito">
            Finalizar Compra
          </h1>

          <form onSubmit={handleSubmit} className="space-y-8">
            {/* Información del Cliente */}
            <div className="bg-white rounded-3xl shadow-kawaii p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-gray-800 font-nunito">
                  Información de Contacto
                </h2>
                {!isAuthenticated && (
                  <Link
                    to="/login"
                    state={{ from: { pathname: '/checkout' } }}
                    className="text-purple-pastel hover:text-purple-600 font-semibold flex items-center gap-2 transition-colors"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                    Iniciar Sesión
                  </Link>
                )}
              </div>
              
              {isAuthenticated ? (
                <div className="mb-4 p-4 bg-green-50 border-2 border-green-200 rounded-xl">
                  <div className="flex items-center gap-2 text-green-700 font-semibold mb-2">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    Sesión iniciada como: {user?.name}
                  </div>
                  <p className="text-sm text-green-600">
                    Usaremos la información de tu cuenta para procesar el pedido.
                  </p>
                </div>
              ) : (
                <div className="mb-4 p-4 bg-blue-50 border-2 border-blue-200 rounded-xl">
                  <p className="text-sm text-blue-700">
                    💡 <strong>¿Ya tienes cuenta?</strong> Inicia sesión para agilizar tu compra y usar tu información guardada.
                  </p>
                </div>
              )}

              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Nombre completo *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    disabled={isAuthenticated}
                    className={`w-full kawaii-input ${isAuthenticated ? 'bg-gray-100 cursor-not-allowed' : ''}`}
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Email *
                  </label>
                  <input
                    type="email"
                    required
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    disabled={isAuthenticated}
                    className={`w-full kawaii-input ${isAuthenticated ? 'bg-gray-100 cursor-not-allowed' : ''}`}
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Teléfono *
                  </label>
                  <input
                    type="tel"
                    required
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    disabled={isAuthenticated}
                    className={`w-full kawaii-input ${isAuthenticated ? 'bg-gray-100 cursor-not-allowed' : ''}`}
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Dirección *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.address}
                    onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                    placeholder="Ingresa tu dirección de entrega"
                    className="w-full kawaii-input"
                  />
                </div>
              </div>
            </div>

            {/* Método de Pago */}
            <div className="bg-white rounded-3xl shadow-kawaii p-6">
              <h2 className="text-2xl font-bold text-gray-800 mb-6 font-nunito">
                Método de Pago
              </h2>
              <div className="space-y-4">
                <label className="flex items-center gap-3 p-4 border-2 border-purple-pastel rounded-2xl cursor-pointer hover:bg-purple-pastel/10">
                  <input
                    type="radio"
                    name="payment_method"
                    value="yape"
                    checked={formData.payment_method === 'yape'}
                    onChange={(e) => setFormData({ ...formData, payment_method: e.target.value })}
                    className="w-5 h-5"
                  />
                  <div>
                    <span className="font-bold text-lg">Yape</span>
                    <p className="text-sm text-gray-600">Paga con Yape escaneando el código QR</p>
                  </div>
                </label>
                <label className="flex items-center gap-3 p-4 border-2 border-gray-200 rounded-2xl cursor-pointer hover:bg-gray-50">
                  <input
                    type="radio"
                    name="payment_method"
                    value="plin"
                    checked={formData.payment_method === 'plin'}
                    onChange={(e) => setFormData({ ...formData, payment_method: e.target.value })}
                    className="w-5 h-5"
                  />
                  <div>
                    <span className="font-bold text-lg">Plin</span>
                    <p className="text-sm text-gray-600">Paga con Plin escaneando el código QR</p>
                  </div>
                </label>
              </div>

              {/* QR Code */}
              <div className="mt-6 p-6 bg-gray-100 rounded-2xl text-center">
                {loadingQr ? (
                  <div className="w-64 h-64 bg-white rounded-xl mx-auto flex items-center justify-center mb-4">
                    <motion.svg
                      animate={{ rotate: 360 }}
                      transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                      className="w-12 h-12 text-purple-pastel"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                    </motion.svg>
                  </div>
                ) : qrUrl ? (
                  <div className="w-64 h-64 bg-white rounded-xl mx-auto flex items-center justify-center mb-4 p-4">
                    <img
                      src={qrUrl}
                      alt={`QR ${formData.payment_method === 'yape' ? 'Yape' : 'Plin'}`}
                      className="w-full h-full object-contain"
                    />
                  </div>
                ) : (
                  <div className="w-64 h-64 bg-white rounded-xl mx-auto flex items-center justify-center mb-4">
                    <div className="text-center">
                      <span className="text-6xl mb-2 block">📱</span>
                      <p className="text-sm text-gray-600">
                        El vendedor no ha configurado el código QR de {formData.payment_method === 'yape' ? 'Yape' : 'Plin'}
                      </p>
                    </div>
                  </div>
                )}
                <p className="text-sm text-gray-600">
                  Escanea el código QR con {formData.payment_method === 'yape' ? 'Yape' : 'Plin'} para realizar el pago
                </p>
              </div>

              {/* Upload Voucher */}
              <div className="mt-6">
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Subir comprobante de pago *
                </label>
                <input
                  type="file"
                  accept="image/*"
                  required
                  onChange={handleFileChange}
                  className="w-full kawaii-input"
                />
                {voucherPreview && (
                  <div className="mt-4">
                    <img
                      src={voucherPreview}
                      alt="Voucher preview"
                      className="w-48 h-48 object-cover rounded-2xl"
                    />
                  </div>
                )}
              </div>
            </div>

            {/* Resumen */}
            <div className="bg-white rounded-3xl shadow-kawaii p-6">
              <h2 className="text-2xl font-bold text-gray-800 mb-6 font-nunito">
                Resumen del Pedido
              </h2>
              <div className="space-y-4">
                {cart.map((item) => {
                  // Obtener la primera imagen del array, luego image_url, luego placeholder
                  let imageUrl = null;
                  if (item.images && item.images.length > 0) {
                    // Si es un objeto con url
                    imageUrl = item.images[0].url || (typeof item.images[0] === 'string' ? item.images[0] : null);
                    // Si no tiene url pero tiene path
                    if (!imageUrl && item.images[0].path) {
                      imageUrl = item.images[0].path;
                    }
                  }
                  if (!imageUrl) {
                    imageUrl = item.image_url;
                  }
                  const displayImage = imageUrl 
                    ? (imageUrl.startsWith('http') ? imageUrl : `${import.meta.env.VITE_API_URL}/storage/${imageUrl}`)
                    : '/placeholder.jpg';
                  
                  return (
                  <div key={item.id} className="flex items-center justify-between border-b border-gray-200 pb-4">
                    <div className="flex items-center gap-4">
                      <img
                        src={displayImage}
                        alt={item.name}
                        className="w-16 h-16 object-cover rounded-xl"
                        onError={(e) => {
                          e.target.src = '/placeholder.jpg';
                        }}
                      />
                      <div>
                        <p className="font-semibold">{item.name}</p>
                        <p className="text-sm text-gray-600">Cantidad: {item.quantity}</p>
                      </div>
                    </div>
                    <p className="font-bold text-lg">
                      {formatPrice((item.discounted_price || item.price) * item.quantity)}
                    </p>
                  </div>
                  );
                })}
                <div className="pt-4 border-t-2 border-gray-200">
                  <div className="flex justify-between items-center">
                    <span className="text-xl font-bold text-gray-800">Total:</span>
                    <span className="text-2xl font-bold text-purple-pastel">
                      {formatPrice(getCartTotal())}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Botones */}
            <div className="flex gap-4">
              <button
                type="button"
                onClick={() => navigate('/cart')}
                className="flex-1 kawaii-button bg-gray-200 text-gray-700 hover:bg-gray-300 flex items-center justify-center gap-2"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                </svg>
                Volver al Carrito
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
                    <span>Procesando...</span>
                  </>
                ) : (
                  <>
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    <span>Confirmar Pedido</span>
                  </>
                )}
              </button>
            </div>
          </form>
        </motion.div>
      </div>
    </div>
  );
};

export default Checkout;

