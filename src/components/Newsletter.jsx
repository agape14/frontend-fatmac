import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { newsletterService } from '../services/newsletterService';
import { homeCmsService } from '../services/homeCmsService';

const Newsletter = () => {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [newsletterText, setNewsletterText] = useState('Suscríbete y obtén el 10% de descuento en tu próxima compra.');

  useEffect(() => {
    const fetchNewsletterText = async () => {
      try {
        const response = await homeCmsService.getNewsletterText();
        if (response.data.data?.text) {
          setNewsletterText(response.data.data.text);
        }
      } catch (err) {
        console.error('Error loading newsletter text:', err);
      }
    };

    fetchNewsletterText();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      await newsletterService.subscribe(email);
      setSuccess(true);
      setEmail('');
      setTimeout(() => setSuccess(false), 3000);
    } catch (err) {
      console.error('Error subscribing to newsletter:', err);
      alert('Error al suscribirse. Por favor, intente nuevamente.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-pink-pastel py-8">
      <div className="container mx-auto px-4">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-gray-800 font-semibold text-lg text-center md:text-left">
            {newsletterText}
          </p>
          
          <form onSubmit={handleSubmit} className="flex gap-3 w-full md:w-auto">
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Correo Electrónico"
              className="kawaii-input flex-1 md:w-64"
              required
            />
            <motion.button
              type="submit"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              disabled={loading}
              className="kawaii-button bg-blue-400 text-white hover:bg-blue-500 px-6 whitespace-nowrap"
            >
              {loading ? 'Enviando...' : success ? '✓ Suscrito' : 'Suscribirse'}
            </motion.button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Newsletter;

