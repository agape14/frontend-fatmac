import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';
import { useCart } from '../context/CartContext';

const CartSidebar = ({ isOpen, onClose }) => {
  const { cart, removeFromCart, updateQuantity, getCartTotal, getCartCount } = useCart();

  const formatPrice = (price) => {
    return new Intl.NumberFormat('es-PE', {
      style: 'currency',
      currency: 'PEN',
    }).format(price);
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Overlay */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/50 z-50"
          />

          {/* Sidebar */}
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="fixed right-0 top-0 h-full w-full max-w-md bg-white shadow-2xl z-50 flex flex-col"
          >
            {/* Header */}
            <div className="bg-gradient-to-r from-purple-pastel to-pink-pastel text-white p-6 flex items-center justify-between">
              <h2 className="text-2xl font-bold font-nunito">
                🛒 Carrito ({getCartCount()})
              </h2>
              <motion.button
                whileHover={{ scale: 1.1, rotate: 90 }}
                whileTap={{ scale: 0.9 }}
                onClick={onClose}
                className="text-white hover:bg-white/20 rounded-full p-2 transition-colors"
                aria-label="Cerrar carrito"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </motion.button>
            </div>

            {/* Contenido */}
            <div className="flex-1 overflow-y-auto p-6">
              {cart.length === 0 ? (
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="flex flex-col items-center justify-center h-full text-center px-4"
                >
                  <motion.div
                    animate={{ y: [0, -10, 0] }}
                    transition={{ duration: 2, repeat: Infinity }}
                    className="text-8xl mb-4"
                  >
                    🛒
                  </motion.div>
                  <h3 className="text-2xl font-bold text-gray-800 mb-2 font-nunito">
                    Tu carrito está vacío
                  </h3>
                  <p className="text-gray-600 mb-6">
                    Agrega productos para comenzar a comprar
                  </p>
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={onClose}
                    className="kawaii-button bg-purple-pastel text-white hover:bg-purple-600"
                  >
                    Seguir Comprando
                  </motion.button>
                </motion.div>
              ) : (
                <div className="space-y-4">
                  {cart.map((item) => {
                    const price = item.discounted_price || item.price;
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
                      <motion.div
                        key={item.id}
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        className="bg-gray-50 rounded-2xl p-4"
                      >
                        <div className="flex gap-4">
                          <img
                            src={displayImage}
                            alt={item.name}
                            className="w-20 h-20 object-cover rounded-xl"
                            onError={(e) => {
                              e.target.src = '/placeholder.jpg';
                            }}
                          />
                          <div className="flex-1">
                            <h3 className="font-bold text-gray-800 mb-1 line-clamp-2">
                              {item.name}
                            </h3>
                            <p className="text-lg font-bold text-purple-pastel mb-2">
                              {formatPrice(price)}
                            </p>
                            <div className="flex items-center gap-3">
                              <div className="flex items-center gap-2 border-2 border-pink-pastel rounded-xl">
                                <button
                                  onClick={() => updateQuantity(item.id, item.quantity - 1)}
                                  className="px-2 py-1 text-gray-700 hover:bg-pink-pastel rounded-l-xl"
                                >
                                  −
                                </button>
                                <span className="px-3 font-semibold">{item.quantity}</span>
                                <button
                                  onClick={() => updateQuantity(item.id, item.quantity + 1)}
                                  className="px-2 py-1 text-gray-700 hover:bg-pink-pastel rounded-r-xl"
                                >
                                  +
                                </button>
                              </div>
                              <button
                                onClick={() => removeFromCart(item.id)}
                                className="text-red-500 hover:text-red-700 text-sm font-semibold"
                              >
                                Eliminar
                              </button>
                            </div>
                            <p className="text-sm text-gray-600 mt-2">
                              Subtotal: {formatPrice(price * item.quantity)}
                            </p>
                          </div>
                        </div>
                      </motion.div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Footer con total y botones */}
            {cart.length > 0 && (
              <div className="border-t border-gray-200 p-6 bg-white">
                <div className="mb-4">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-gray-600">Subtotal:</span>
                    <span className="font-semibold">{formatPrice(getCartTotal())}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Envío:</span>
                    <span className="font-semibold text-green-600">Gratis</span>
                  </div>
                  <div className="flex justify-between items-center mt-3 pt-3 border-t-2 border-gray-200">
                    <span className="text-xl font-bold text-gray-800">Total:</span>
                    <span className="text-2xl font-bold text-purple-pastel">
                      {formatPrice(getCartTotal())}
                    </span>
                  </div>
                </div>
                <div className="space-y-3">
                  <Link
                    to="/cart"
                    onClick={onClose}
                    className="block w-full kawaii-button bg-purple-pastel text-white hover:bg-purple-600 text-center py-3 font-bold flex items-center justify-center gap-2"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                    </svg>
                    Ver Carrito Completo
                  </Link>
                  <button
                    onClick={onClose}
                    className="w-full kawaii-button bg-gray-200 text-gray-700 hover:bg-gray-300 py-3 font-semibold flex items-center justify-center gap-2"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                    </svg>
                    Seguir Comprando
                  </button>
                </div>
              </div>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default CartSidebar;

