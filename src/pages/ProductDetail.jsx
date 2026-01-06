import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { productService } from '../services/productService';
import { useCart } from '../context/CartContext';
import PurchaseModal from '../components/PurchaseModal';
import Swal from 'sweetalert2';

const ProductDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { addToCart } = useCart();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showPurchaseModal, setShowPurchaseModal] = useState(false);
  const [isAdding, setIsAdding] = useState(false);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await productService.getById(id);
        setProduct(response.data.data);
      } catch (err) {
        setError(err.response?.data?.message || 'Error al cargar el producto');
      } finally {
        setLoading(false);
      }
    };

    fetchProduct();
  }, [id]);

  const formatPrice = (price) => {
    return new Intl.NumberFormat('es-PE', {
      style: 'currency',
      currency: 'PEN',
    }).format(price);
  };

  const handleWhatsAppClick = async () => {
    if (!product?.vendor?.phone_number) {
      await Swal.fire({
        icon: 'warning',
        title: 'Número no disponible',
        text: 'El vendedor no tiene número de teléfono registrado',
        confirmButtonText: 'Entendido',
        confirmButtonColor: '#a855f7',
        customClass: {
          popup: 'kawaii-card',
          confirmButton: 'kawaii-button bg-purple-pastel text-white hover:bg-purple-600',
        },
      });
      return;
    }

    const phoneNumber = product.vendor.phone_number.replace(/\D/g, ''); // Solo números
    const message = encodeURIComponent(
      `¡Hola! Me interesa el producto: ${product.name} - ${formatPrice(product.price)}`
    );
    const whatsappUrl = `https://wa.me/${phoneNumber}?text=${message}`;
    window.open(whatsappUrl, '_blank');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-pink-pastel via-purple-pastel to-yellow-pastel flex items-center justify-center">
        <div className="text-4xl animate-bounce">🛍️</div>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-pink-pastel via-purple-pastel to-yellow-pastel flex items-center justify-center">
        <div className="text-center">
          <p className="text-xl text-gray-700 mb-4">{error || 'Producto no encontrado'}</p>
          <button
            onClick={() => navigate('/')}
            className="kawaii-button bg-purple-pastel text-white"
          >
            Volver al inicio
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-pastel via-purple-pastel to-yellow-pastel py-8">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="max-w-4xl mx-auto"
        >
          <button
            onClick={() => navigate(-1)}
            className="mb-6 text-gray-700 hover:text-purple-pastel transition-colors flex items-center gap-2"
          >
            ← Volver
          </button>

          <div className="kawaii-card">
            <div className="grid md:grid-cols-2 gap-8">
              {/* Imágenes del producto */}
              <div>
                {(() => {
                  const images = product.images && product.images.length > 0 
                    ? product.images 
                    : (product.image_url ? [{ url: product.image_url }] : []);
                  
                  if (images.length === 0) {
                    return (
                      <div className="w-full h-96 bg-gradient-to-br from-pink-pastel to-purple-pastel rounded-3xl flex items-center justify-center">
                        <span className="text-8xl">🛍️</span>
                      </div>
                    );
                  }
                  
                  return (
                    <div className="space-y-4">
                      {/* Imagen principal */}
                      <div className="relative">
                        <img
                          src={images[selectedImageIndex]?.url || images[0].url}
                          alt={product.name}
                          className="w-full h-96 object-cover rounded-3xl"
                        />
                        {images.length > 1 && (
                          <>
                            {/* Botón anterior */}
                            {selectedImageIndex > 0 && (
                              <button
                                onClick={() => setSelectedImageIndex(selectedImageIndex - 1)}
                                className="absolute left-4 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white rounded-full p-2 shadow-lg transition-all"
                              >
                                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                                </svg>
                              </button>
                            )}
                            {/* Botón siguiente */}
                            {selectedImageIndex < images.length - 1 && (
                              <button
                                onClick={() => setSelectedImageIndex(selectedImageIndex + 1)}
                                className="absolute right-4 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white rounded-full p-2 shadow-lg transition-all"
                              >
                                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                </svg>
                              </button>
                            )}
                            {/* Indicadores */}
                            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
                              {images.map((_, index) => (
                                <button
                                  key={index}
                                  onClick={() => setSelectedImageIndex(index)}
                                  className={`w-2 h-2 rounded-full transition-all ${
                                    index === selectedImageIndex ? 'bg-white w-8' : 'bg-white/50'
                                  }`}
                                />
                              ))}
                            </div>
                          </>
                        )}
                      </div>
                      {/* Galería de imágenes en miniatura */}
                      {images.length > 1 && (
                        <div className="grid grid-cols-4 gap-2">
                          {images.map((image, index) => (
                            <button
                              key={index}
                              onClick={() => setSelectedImageIndex(index)}
                              className={`relative overflow-hidden rounded-xl transition-all ${
                                index === selectedImageIndex ? 'ring-2 ring-purple-pastel' : 'opacity-70 hover:opacity-100'
                              }`}
                            >
                              <img
                                src={image.url}
                                alt={`${product.name} ${index + 1}`}
                                className="w-full h-20 object-cover"
                              />
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                  );
                })()}
              </div>

              {/* Información del producto */}
              <div className="space-y-6">
                <div>
                  <h1 className="text-3xl font-bold text-gray-800 mb-2">
                    {product.name}
                  </h1>
                  {product.description && (
                    <p className="text-gray-600 leading-relaxed">
                      {product.description}
                    </p>
                  )}
                </div>

                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-4xl font-bold text-purple-pastel">
                      {formatPrice(product.price)}
                    </span>
                    {product.condition && (
                      <span className="text-sm px-4 py-2 rounded-full bg-yellow-pastel text-gray-700 font-medium">
                        {product.condition === 'nuevo' ? '✨ Nuevo' : '🔄 Usado'}
                      </span>
                    )}
                  </div>

                  {product.stock !== undefined && (
                    <p className="text-sm text-gray-600">
                      Stock disponible: <span className="font-semibold">{product.stock}</span>
                    </p>
                  )}

                  {product.category && (
                    <p className="text-sm text-gray-600">
                      Categoría: <span className="font-semibold">{product.category}</span>
                    </p>
                  )}

                  {product.vendor && (
                    <div className="pt-4 border-t border-gray-200">
                      <p className="text-sm text-gray-600 mb-1">Vendedor:</p>
                      <p className="font-semibold text-gray-800">{product.vendor.name}</p>
                    </div>
                  )}
                </div>

                <div className="flex gap-3 pt-4">
                  <motion.button
                    whileHover={{ scale: isAdding ? 1 : 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={async () => {
                      setIsAdding(true);
                      try {
                        await addToCart(product);
                      } finally {
                        setIsAdding(false);
                      }
                    }}
                    disabled={isAdding}
                    className={`flex-1 kawaii-button flex items-center justify-center gap-2 transition-all ${
                      isAdding
                        ? 'bg-green-500 text-white'
                        : 'bg-purple-pastel text-white hover:bg-purple-600'
                    }`}
                  >
                    {isAdding ? (
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
                        <span>Agregando...</span>
                      </>
                    ) : (
                      <>
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
                        </svg>
                        Agregar al Carrito
                      </>
                    )}
                  </motion.button>

                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={handleWhatsAppClick}
                    className="kawaii-button bg-green-500 text-white hover:bg-green-600 rounded-full p-3"
                    title="Contactar por WhatsApp"
                  >
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z" />
                    </svg>
                  </motion.button>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </div>

      {showPurchaseModal && (
        <PurchaseModal
          product={product}
          onClose={() => setShowPurchaseModal(false)}
        />
      )}
    </div>
  );
};

export default ProductDetail;

