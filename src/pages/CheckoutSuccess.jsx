import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { useEffect } from 'react';

const CheckoutSuccess = () => {
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  return (
    <div className="min-h-screen py-12 bg-blue-50 flex items-center justify-center">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-white rounded-3xl shadow-kawaii p-12 max-w-2xl text-center"
      >
        <div className="text-8xl mb-6">✅</div>
        <h1 className="text-4xl font-bold text-gray-800 mb-4 font-nunito">
          ¡Pedido Confirmado!
        </h1>
        <p className="text-lg text-gray-600 mb-8">
          Tu pedido ha sido recibido y está siendo procesado. Te contactaremos pronto para confirmar los detalles.
        </p>
        <div className="flex gap-4 justify-center">
          <Link
            to="/"
            className="kawaii-button bg-purple-pastel text-white hover:bg-purple-600"
          >
            Volver al Inicio
          </Link>
          <Link
            to="/novedades"
            className="kawaii-button bg-pink-pastel text-gray-800 hover:bg-pink-300"
          >
            Ver Más Productos
          </Link>
        </div>
      </motion.div>
    </div>
  );
};

export default CheckoutSuccess;

