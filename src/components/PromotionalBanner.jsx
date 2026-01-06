import { motion } from 'framer-motion';
import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { homeCmsService } from '../services/homeCmsService';
import { getImageUrl } from '../utils/imageUtils';

const PromotionalBanner = () => {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [banners, setBanners] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchBanners = async () => {
      try {
        const response = await homeCmsService.getHomeBanners();
        setBanners(response.data.data || []);
      } catch (err) {
        console.error('Error loading home banners:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchBanners();
  }, []);

  if (loading || banners.length === 0) {
    return null;
  }

  const banner = banners[currentSlide] || banners[0];
  
  // Determinar si el background_color es un color hexadecimal o una clase de Tailwind
  const isHexColor = banner.background_color && banner.background_color.startsWith('#');
  const bgClasses = banner.background_color && !isHexColor 
    ? banner.background_color 
    : 'from-pink-pastel via-purple-pastel to-yellow-pastel';

  // Estilo de fondo: imagen o color
  const backgroundStyle = {};
  
  if (banner.background_image_url) {
    // Si hay imagen, usar la imagen como fondo
    const imageUrl = getImageUrl(banner.background_image_url);
    backgroundStyle.backgroundImage = `url(${imageUrl})`;
    backgroundStyle.backgroundSize = 'cover';
    backgroundStyle.backgroundPosition = 'center';
  } else if (isHexColor) {
    // Si es un color hexadecimal, aplicarlo directamente
    backgroundStyle.backgroundColor = banner.background_color;
  } else if (banner.background_color) {
    // Si es una clase de Tailwind, se aplicará en className
  }

  return (
    <div 
      className={`relative overflow-hidden min-h-[500px] md:min-h-[600px] flex items-center ${!banner.background_image_url && !isHexColor ? `bg-gradient-to-br ${bgClasses}` : ''}`}
      style={backgroundStyle}
    >
      {/* Overlay oscuro cuando hay imagen de fondo para mejorar legibilidad del texto */}
      {banner.background_image_url && (
        <div className="absolute inset-0 bg-black/40 z-0"></div>
      )}
      
      <div className="container mx-auto px-4 max-w-7xl relative z-10 w-full py-12 md:py-16">
        <div className="grid md:grid-cols-2 gap-8 md:gap-12 items-center">
          {/* Contenido */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="text-center md:text-left order-2 md:order-1 relative z-10"
          >
            {banner.title && (
              <div className="mb-4">
                <span className="inline-block px-4 py-1.5 bg-white/20 backdrop-blur-sm rounded-full text-white text-sm font-semibold mb-3">
                  {banner.title}
                </span>
              </div>
            )}
            {banner.subtitle && (
              <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-6 font-nunito leading-tight">
                {banner.subtitle}
              </h2>
            )}
            {banner.button_link ? (
              <Link to={banner.button_link}>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="bg-white text-purple-pastel px-8 py-4 rounded-2xl font-bold text-lg shadow-lg hover:shadow-xl transition-all inline-flex items-center gap-2"
                >
                  {banner.button_text || 'VER AHORA'}
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </motion.button>
              </Link>
            ) : (
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="bg-white text-purple-pastel px-8 py-4 rounded-2xl font-bold text-lg shadow-lg hover:shadow-xl transition-all inline-flex items-center gap-2"
              >
                {banner.button_text || 'VER AHORA'}
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </motion.button>
            )}
          </motion.div>
        </div>

        {/* Indicadores del carousel */}
        {banners.length > 1 && (
          <div className="flex justify-center gap-2 mt-8">
            {banners.map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentSlide(index)}
                className={`h-2 rounded-full transition-all ${
                  currentSlide === index ? 'bg-white w-8' : 'bg-white/50 w-2'
                }`}
                aria-label={`Ir al banner ${index + 1}`}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default PromotionalBanner;

