import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useNavigate } from 'react-router-dom';
import { useEffect } from 'react';

const Cart = () => {
  const { cart, removeFromCart, updateQuantity, clearCart, getCartTotal } = useCart();
  const navigate = useNavigate();

  useEffect(() => {
    // Scroll al inicio al cargar la página
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  const formatPrice = (price) => {
    return new Intl.NumberFormat('es-PE', {
      style: 'currency',
      currency: 'PEN',
    }).format(price);
  };

  const handleCheckout = () => {
    if (cart.length === 0) return;
    // TODO: Implementar proceso de pago
    navigate('/checkout');
  };

  if (cart.length === 0) {
    return (
      <div className="min-h-screen py-12">
        <div className="container mx-auto px-4 max-w-4xl">
          <div className="text-center py-16">
            <div className="text-6xl mb-4">🛒</div>
            <h2 className="text-3xl font-bold text-gray-800 mb-4 font-nunito">
              Tu carrito está vacío
            </h2>
            <p className="text-gray-600 mb-8">Agrega productos para comenzar a comprar</p>
            <Link
              to="/"
              className="kawaii-button bg-purple-pastel text-white hover:bg-purple-600 inline-block"
            >
              Ir a la tienda
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen py-12 bg-blue-50 pb-0">
      <div className="container mx-auto px-4 max-w-6xl">
        <h1 className="text-4xl font-bold text-gray-800 mb-8 font-nunito">
          Carrito de Compras
        </h1>

        <div className="grid md:grid-cols-3 gap-8">
          {/* Lista de productos */}
          <div className="md:col-span-2 space-y-4">
            {cart.map((item) => {
              const price = item.discounted_price || item.price;
              return (
                <motion.div
                  key={item.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="bg-white rounded-3xl shadow-kawaii p-6"
                >
                  <div className="flex gap-4">
                    <img
                      src={item.image_url || '/placeholder.jpg'}
                      alt={item.name}
                      className="w-24 h-24 object-cover rounded-2xl"
                    />
                    <div className="flex-1">
                      <h3 className="font-bold text-lg text-gray-800 mb-2">{item.name}</h3>
                      <p className="text-2xl font-bold text-gray-900 mb-4">
                        {formatPrice(price)}
                      </p>
                      <div className="flex items-center gap-4">
                        <div className="flex items-center gap-2 border-2 border-pink-pastel rounded-xl">
                          <button
                            onClick={() => updateQuantity(item.id, item.quantity - 1)}
                            className="px-3 py-1 text-gray-700 hover:bg-pink-pastel rounded-l-xl"
                          >
                            −
                          </button>
                          <span className="px-4 font-semibold">{item.quantity}</span>
                          <button
                            onClick={() => updateQuantity(item.id, item.quantity + 1)}
                            className="px-3 py-1 text-gray-700 hover:bg-pink-pastel rounded-r-xl"
                          >
                            +
                          </button>
                        </div>
                        <button
                          onClick={() => removeFromCart(item.id)}
                          className="text-red-500 hover:text-red-700 font-semibold"
                        >
                          Eliminar
                        </button>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-xl font-bold text-gray-900">
                        {formatPrice(price * item.quantity)}
                      </p>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>

          {/* Resumen */}
          <div className="md:col-span-1">
            <div className="bg-white rounded-3xl shadow-kawaii p-6 sticky top-24">
              <h2 className="text-2xl font-bold text-gray-800 mb-6 font-nunito">
                Resumen
              </h2>
              <div className="space-y-4 mb-6">
                <div className="flex justify-between">
                  <span className="text-gray-600">Subtotal:</span>
                  <span className="font-semibold">{formatPrice(getCartTotal())}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Envío:</span>
                  <span className="font-semibold">Gratis</span>
                </div>
                <div className="border-t-2 border-gray-200 pt-4">
                  <div className="flex justify-between">
                    <span className="text-xl font-bold text-gray-800">Total:</span>
                    <span className="text-2xl font-bold text-purple-pastel">
                      {formatPrice(getCartTotal())}
                    </span>
                  </div>
                </div>
              </div>
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={handleCheckout}
                className="w-full kawaii-button bg-purple-pastel text-white hover:bg-purple-600 py-3 font-bold text-lg mb-4 flex items-center justify-center gap-2"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                </svg>
                Proceder al Pago
              </motion.button>
              <button
                onClick={clearCart}
                className="w-full text-gray-600 hover:text-red-500 font-semibold py-2 flex items-center justify-center gap-2 transition-colors"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
                Vaciar carrito
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Cart;

