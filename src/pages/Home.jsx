import { useState, useEffect, useMemo } from 'react';
import { motion } from 'framer-motion';
import PromotionalBanner from '../components/PromotionalBanner';
import CategoryBanners from '../components/CategoryBanners';
import ProductSection from '../components/ProductSection';
import Newsletter from '../components/Newsletter';
import VendorRegistrationModal from '../components/VendorRegistrationModal';
import { productService } from '../services/productService';

const Home = () => {
  const [allProducts, setAllProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showVendorModal, setShowVendorModal] = useState(false);

  // Cargar todos los productos una sola vez
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true);
        setError(null);
        
        // Cargar todos los productos en una sola petición
        // Nota: El backend tiene paginación por defecto (15 productos), 
        // pero para el home cargamos los primeros 50 productos
        const response = await productService.getAll({ page: 1 });
        setAllProducts(response.data.data || []);
      } catch (err) {
        console.error('Error loading products:', err);
        setError('Error al cargar productos');
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, []); // Solo se ejecuta una vez al montar el componente

  // Filtrar productos en memoria (sin llamadas adicionales a la API)
  const newProducts = useMemo(() => {
    return allProducts.filter(p => p.is_new).slice(0, 8);
  }, [allProducts]);

  const discountProducts = useMemo(() => {
    return allProducts.filter(p => p.discount_percentage && p.discount_percentage > 0).slice(0, 8);
  }, [allProducts]);

  return (
    <div className="bg-white">
      {/* Banner Promocional */}
      <PromotionalBanner />

      {/* Invitación a ser vendedor */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="container mx-auto px-4 py-8"
      >
        <div className="bg-gradient-to-r from-purple-pastel via-pink-pastel to-yellow-pastel rounded-3xl p-8 shadow-kawaii-lg">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex-1">
              <h2 className="text-3xl font-bold text-gray-800 mb-2 font-nunito">
                🛍️ ¿Quieres vender tus productos?
              </h2>
              <p className="text-gray-700 text-lg">
                Únete como vendedor a nuestra plataforma y llega a más clientes. 
                Es fácil, rápido y sin complicaciones.
              </p>
            </div>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setShowVendorModal(true)}
              className="kawaii-button bg-white text-purple-pastel hover:bg-gray-50 px-8 py-4 text-lg font-bold whitespace-nowrap"
            >
              Regístrate como Vendedor
            </motion.button>
          </div>
        </div>
      </motion.div>

      {/* Banners de Categorías */}
      <CategoryBanners />

      {/* Nuevos Productos */}
      <ProductSection
        title="Nuevos Productos"
        products={newProducts}
        loading={loading}
        error={error}
        filters={{ is_new: true }}
      />

      {/* Descuentos Únicos */}
      <ProductSection
        title="Ofertas Especiales"
        products={discountProducts}
        loading={loading}
        error={error}
        filters={{ has_discount: true }}
      />

      {/* Newsletter */}
      <Newsletter />

      {/* Modal de registro de vendedor */}
      <VendorRegistrationModal
        isOpen={showVendorModal}
        onClose={() => setShowVendorModal(false)}
      />
    </div>
  );
};

export default Home;
