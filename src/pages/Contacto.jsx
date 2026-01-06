import { motion } from 'framer-motion';

const Contacto = () => {
  const handleWhatsAppClick = () => {
    const phoneNumber = import.meta.env.VITE_WHATSAPP_NUMBER || '999999999';
    const cleanPhone = phoneNumber.replace(/\D/g, '');
    const message = encodeURIComponent('¡Hola! Me gustaría contactar con FATMAC Shop');
    const whatsappUrl = `https://wa.me/${cleanPhone}?text=${message}`;
    window.open(whatsappUrl, '_blank');
  };

  return (
    <div className="min-h-screen py-16">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="max-w-2xl mx-auto"
        >
          <div className="kawaii-card text-center">
            <h1 className="text-4xl font-bold text-gray-800 mb-6 font-nunito">
              Contacto
            </h1>
            
            <p className="text-gray-600 mb-8 text-lg">
              ¿Tienes alguna pregunta o necesitas ayuda? ¡Estamos aquí para ti!
            </p>

            <div className="space-y-6">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={handleWhatsAppClick}
                className="w-full kawaii-button bg-green-500 text-white hover:bg-green-600 flex items-center justify-center gap-3 text-lg"
              >
                <span className="text-2xl">💬</span>
                Contactar por WhatsApp
              </motion.button>

              <div className="pt-6 border-t border-gray-200">
                <h2 className="text-2xl font-bold text-gray-800 mb-4">
                  Información de Contacto
                </h2>
                <div className="space-y-3 text-gray-600">
                  <p className="flex items-center justify-center gap-2">
                    <span className="text-xl">📧</span>
                    <span>info@fatmacshop.com</span>
                  </p>
                  <p className="flex items-center justify-center gap-2">
                    <span className="text-xl">📱</span>
                    <span>+51 999 999 999</span>
                  </p>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default Contacto;

