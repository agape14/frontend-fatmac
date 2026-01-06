import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { useState } from 'react';
import { useCart } from '../context/CartContext';
import Swal from 'sweetalert2';

const ProductCard = ({ product, showWhatsAppButton = false, showBuyButton = false }) => {
  const { addToCart } = useCart();
  const [isAdding, setIsAdding] = useState(false);
  const formatPrice = (price) => {
    return new Intl.NumberFormat('es-PE', {
      style: 'currency',
      currency: 'PEN',
    }).format(price);
  };

  const handleAddToCart = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsAdding(true);
    try {
      await addToCart(product);
      await Swal.fire({
        icon: 'success',
        title: '¡Agregado!',
        text: 'Producto agregado al carrito',
        timer: 1500,
        showConfirmButton: false,
        customClass: {
          popup: 'kawaii-card',
        },
      });
    } catch (error) {
      await Swal.fire({
        icon: 'warning',
        title: 'No se pudo agregar',
        text: error.message || 'Error al agregar producto al carrito',
        confirmButtonText: 'Entendido',
        confirmButtonColor: '#a855f7',
        customClass: {
          popup: 'kawaii-card',
          confirmButton: 'kawaii-button bg-purple-pastel text-white hover:bg-purple-600',
        },
      });
    } finally {
      setIsAdding(false);
    }
  };

  const handleWhatsAppClick = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    
    // Priorizar whatsapp_number del vendedor, luego phone_number, luego configuración global
    let phoneNumber = product?.vendor?.whatsapp_number || product?.vendor?.phone_number;
    
    // Si no hay número del vendedor, usar configuración global (se cargará dinámicamente)
    if (!phoneNumber) {
      try {
        const { settingsService } = await import('../services/settingsService');
        const response = await settingsService.get('whatsapp_number');
        phoneNumber = response.data.data?.value;
      } catch (error) {
        console.error('Error al cargar número de WhatsApp:', error);
      }
    }

    if (!phoneNumber) {
      await Swal.fire({
        icon: 'warning',
        title: 'Número no disponible',
        text: 'No hay número de WhatsApp configurado para contactar',
        confirmButtonText: 'Entendido',
        confirmButtonColor: '#a855f7',
        customClass: {
          popup: 'kawaii-card',
          confirmButton: 'kawaii-button bg-purple-pastel text-white hover:bg-purple-600',
        },
      });
      return;
    }

    const cleanPhone = phoneNumber.replace(/\D/g, '');
    const message = encodeURIComponent(
      `¡Hola! Me interesa el producto: ${product.name} - ${formatPrice(product.discounted_price || product.price)}`
    );
    const whatsappUrl = `https://wa.me/${cleanPhone}?text=${message}`;
    window.open(whatsappUrl, '_blank');
  };

  const hasDiscount = product.discount_percentage && product.discount_percentage > 0;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      whileHover={{ y: -5 }}
      className="bg-white rounded-3xl shadow-kawaii overflow-hidden transition-all duration-300 hover:shadow-kawaii-lg relative"
    >
      {/* Badge de descuento */}
      {hasDiscount && (
        <div className="absolute top-3 left-3 bg-red-500 text-white px-3 py-1 rounded-full text-sm font-bold z-10">
          {product.discount_percentage}%
        </div>
      )}

      <Link to={`/products/${product.id}`} className="block">
        <div className="relative">
          {(() => {
            // Priorizar imágenes del array, luego image_url, luego placeholder
            const imageUrl = (product.images && product.images.length > 0) 
              ? product.images[0].url 
              : product.image_url;
            
            return imageUrl ? (
              <img
                src={imageUrl}
                alt={product.name}
                className="w-full h-64 object-cover"
              />
            ) : (
              <div className="w-full h-64 bg-gradient-to-br from-pink-pastel to-purple-pastel flex items-center justify-center">
                <span className="text-6xl">🛍️</span>
              </div>
            );
          })()}
        </div>
      </Link>
      
      <div className="p-5 space-y-3">
        <Link to={`/products/${product.id}`}>
          <h3 className="text-lg font-bold text-gray-800 line-clamp-2 hover:text-purple-pastel transition-colors min-h-[3rem]">
            {product.name}
          </h3>
        </Link>
        
        <div className="flex items-center justify-between gap-2 flex-wrap">
          <div className="flex items-center gap-2 flex-wrap">
            {hasDiscount ? (
              <>
                <span className="text-lg text-gray-400 line-through">
                  {formatPrice(product.price)}
                </span>
                <span className="text-2xl font-bold text-gray-900">
                  {formatPrice(product.discounted_price)}
                </span>
              </>
            ) : (
              <span className="text-2xl font-bold text-gray-900">
                {formatPrice(product.price)}
              </span>
            )}
          </div>
          {/* Stock y Vendedor */}
          <div className="flex items-center gap-2 flex-wrap">
            {product.stock !== null && (
              <div className={`text-sm font-semibold px-2 py-1 rounded-full ${
                product.stock > 10 
                  ? 'bg-green-100 text-green-700' 
                  : product.stock > 0 
                  ? 'bg-yellow-100 text-yellow-700' 
                  : 'bg-red-100 text-red-700'
              }`}>
                {product.stock > 0 ? `Stock: ${product.stock}` : 'Sin stock'}
              </div>
            )}
            {product.vendor && (
              <div className="text-xs text-gray-600 px-2 py-1 bg-gray-100 rounded-full">
                Vendedor: <span className="font-semibold text-purple-pastel">{product.vendor.name}</span>
              </div>
            )}
          </div>
        </div>

        {/* Botones de acción */}
        <div className="flex gap-2">
          {showBuyButton && (
            <motion.button
              whileHover={{ scale: isAdding ? 1 : 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleAddToCart}
              disabled={isAdding || (product.stock !== null && product.stock <= 0)}
              className={`flex-1 kawaii-button flex items-center justify-center gap-2 py-2.5 transition-all ${
                isAdding
                  ? 'bg-green-500 text-white'
                  : (product.stock !== null && product.stock <= 0)
                  ? 'bg-gray-400 text-white cursor-not-allowed'
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
                  <span className="font-semibold">Agregando...</span>
                </>
              ) : (
                <>
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                  <span className="font-semibold">
                    {product.stock !== null && product.stock <= 0 ? 'Sin stock' : 'Comprar'}
                  </span>
                </>
              )}
            </motion.button>
          )}

          {/* Botón WhatsApp redondo */}
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={handleWhatsAppClick}
            className="kawaii-button bg-green-500 text-white hover:bg-green-600 rounded-full p-2.5 flex items-center justify-center"
            title="Contactar por WhatsApp"
          >
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
              <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z" />
            </svg>
          </motion.button>
        </div>
      </div>
    </motion.div>
  );
};

export default ProductCard;

