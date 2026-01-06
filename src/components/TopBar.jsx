import { motion } from 'framer-motion';
import { useState, useEffect } from 'react';
import { homeCmsService } from '../services/homeCmsService';

const TopBar = () => {
  const [bannerData, setBannerData] = useState({
    text: 'ENVÍO GRATIS DESDE S/79',
    background_color: '#3B82F6',
    text_color: '#FFFFFF',
    is_active: true,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchBannerData = async () => {
      try {
        const response = await homeCmsService.getTopBanner();
        if (response.data.data) {
          setBannerData(response.data.data);
        }
      } catch (err) {
        console.error('Error loading top banner:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchBannerData();
  }, []);

  if (loading || !bannerData.is_active) {
    return null;
  }

  return (
    <div 
      className="text-white py-2 overflow-hidden"
      style={{ 
        backgroundColor: bannerData.background_color,
        color: bannerData.text_color 
      }}
    >
      <motion.div
        className="flex whitespace-nowrap"
        animate={{
          x: [0, -1000],
        }}
        transition={{
          x: {
            repeat: Infinity,
            repeatType: "loop",
            duration: 20,
            ease: "linear",
          },
        }}
      >
        {[...Array(4)].map((_, i) => (
          <span key={i} className="px-8 text-sm font-medium">
            {bannerData.text}
          </span>
        ))}
      </motion.div>
    </div>
  );
};

export default TopBar;

