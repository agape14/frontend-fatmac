import { Link } from 'react-router-dom';
import { useState } from 'react';
import { motion } from 'framer-motion';
import { useCart } from '../context/CartContext';
import Swal from 'sweetalert2';

const ProductCardMinimal = ({ product, showBuyButton = false }) => {
  const { addToCart } = useCart();
  const [isAdding, setIsAdding] = useState(false);
  
  const formatPrice = (price) => {
    return new Intl.NumberFormat('es-PE', {
      style: 'currency',
      currency: 'PEN',
      minimumFractionDigits: 2,
    }).format(price);
  };

  const handleAddToCart = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsAdding(true);
    try {
      await addToCart(product);
    } finally {
      setIsAdding(false);
    }
  };

  const hasDiscount = product.discount_percentage && product.discount_percentage > 0;
  const categoryName = product.category_data?.name || product.category || '';

  return (
    <div className="bg-white rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-shadow duration-200">
      <Link to={`/products/${product.id}`} className="block">
        {/* Imagen */}
        <div className="relative aspect-square bg-gray-100">
          {(() => {
            // Priorizar imágenes del array, luego image_url, luego placeholder
            const imageUrl = (product.images && product.images.length > 0) 
              ? product.images[0].url 
              : product.image_url;
            
            return imageUrl ? (
              <img
                src={imageUrl}
                alt={product.name}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center">
                <span className="text-4xl text-gray-400">🛍️</span>
              </div>
            );
          })()}
          
          {/* Badge de estado */}
          {product.condition && (
            <div className={`absolute top-2 left-2 px-2 py-1 rounded text-xs font-medium ${
              product.condition === 'nuevo' 
                ? 'bg-blue-100 text-blue-800' 
                : 'bg-orange-100 text-orange-800'
            }`}>
              {product.condition === 'nuevo' ? 'Nuevo' : 'Segunda Mano'}
            </div>
          )}
        </div>
      </Link>

      {/* Contenido */}
      <div className="p-4 space-y-3">
        {/* Categoría */}
        {categoryName && (
          <div className="text-xs font-medium text-gray-500 uppercase tracking-wide">
            {categoryName}
          </div>
        )}

        {/* Nombre */}
        <Link to={`/products/${product.id}`}>
          <h3 className="text-sm font-semibold text-gray-900 line-clamp-2 hover:text-purple-pastel transition-colors min-h-[2.5rem]">
            {product.name}
          </h3>
        </Link>

        {/* Precio */}
        <div className="flex items-center gap-2">
          {hasDiscount ? (
            <>
              <span className="text-xs text-gray-400 line-through">
                {formatPrice(product.price)}
              </span>
              <span className="text-lg font-bold text-gray-900">
                {formatPrice(product.discounted_price)}
              </span>
            </>
          ) : (
            <span className="text-lg font-bold text-gray-900">
              {formatPrice(product.price)}
            </span>
          )}
        </div>

        {/* Botones de acción */}
        <div className="flex gap-2">
          {showBuyButton && (
            <button
              onClick={handleAddToCart}
              disabled={isAdding}
              className={`flex-1 py-2 px-4 rounded-lg text-sm font-medium transition-all flex items-center justify-center gap-2 ${
                isAdding
                  ? 'bg-green-500 text-white cursor-not-allowed'
                  : 'bg-purple-pastel text-white hover:bg-purple-600'
              }`}
            >
              {isAdding ? (
                <>
                  <motion.svg
                    animate={{ rotate: 360 }}
                    transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                    className="w-4 h-4"
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
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                  <span>Añadir al carrito</span>
                </>
              )}
            </button>
          )}

          {/* Botón WhatsApp */}
          <button
            onClick={async (e) => {
              e.preventDefault();
              e.stopPropagation();
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

              const phoneNumber = product.vendor.phone_number.replace(/\D/g, '');
              const message = encodeURIComponent(
                `¡Hola! Me interesa el producto: ${product.name} - ${formatPrice(product.discounted_price || product.price)}`
              );
              const whatsappUrl = `https://wa.me/${phoneNumber}?text=${message}`;
              window.open(whatsappUrl, '_blank');
            }}
            className="bg-green-500 text-white hover:bg-green-600 rounded-lg p-2 flex items-center justify-center transition-colors"
            title="Contactar por WhatsApp"
          >
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
              <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProductCardMinimal;

