import { motion, AnimatePresence } from 'framer-motion';
import { useEffect, useState } from 'react';
import { useCart } from '../context/CartContext';

const CartNotification = () => {
  const { showCartAnimation, lastAddedProduct } = useCart();
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    if (showCartAnimation) {
      setIsVisible(true);
      const timer = setTimeout(() => {
        setIsVisible(false);
      }, 3000);
      return () => clearTimeout(timer);
    } else {
      setIsVisible(false);
    }
  }, [showCartAnimation]);

  return (
    <AnimatePresence>
      {isVisible && (
        <div className="fixed top-20 left-1/2 transform -translate-x-1/2 z-[60]">
          {/* Ondas de sismo - múltiples círculos que se expanden */}
          {[0, 1, 2].map((index) => (
            <motion.div
              key={index}
              initial={{ scale: 0.8, opacity: 0.8 }}
              animate={{
                scale: [0.8, 1.5, 2],
                opacity: [0.8, 0.4, 0],
              }}
              transition={{
                duration: 1.5,
                repeat: Infinity,
                delay: index * 0.3,
                ease: 'easeOut',
              }}
              className="absolute inset-0 bg-purple-pastel rounded-2xl blur-sm"
              style={{
                width: '100%',
                height: '100%',
              }}
            />
          ))}
          
          {/* Notificación principal */}
          <motion.div
            initial={{ opacity: 0, y: -50, scale: 0.8 }}
            animate={{ 
              opacity: 1, 
              y: 0, 
              scale: 1,
            }}
            exit={{ opacity: 0, y: -50, scale: 0.8 }}
            transition={{
              opacity: { duration: 0.3 },
              y: { duration: 0.3 },
              scale: { duration: 0.3 },
            }}
            className="relative bg-gradient-to-r from-purple-pastel to-pink-pastel text-white px-6 py-3 rounded-2xl shadow-kawaii-lg flex items-center gap-3 border-2 border-white/30"
          >
            <motion.div
              animate={{ 
                scale: [1, 1.2, 1],
                rotate: [0, 10, -10, 0],
              }}
              transition={{
                duration: 0.6,
                repeat: Infinity,
                ease: 'easeInOut',
              }}
              className="text-2xl"
            >
              ✅
            </motion.div>
            <div>
              <p className="font-bold text-sm">
                ¡{lastAddedProduct?.name ? `"${lastAddedProduct.name.substring(0, 30)}${lastAddedProduct.name.length > 30 ? '...' : ''}"` : 'Producto'} agregado!
              </p>
              <p className="text-xs opacity-90">Haz clic en el carrito para ver</p>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

export default CartNotification;

