import { useState, useEffect, useMemo } from 'react';
import PromotionalBanner from '../components/PromotionalBanner';
import CategoryBanners from '../components/CategoryBanners';
import ProductSection from '../components/ProductSection';
import Newsletter from '../components/Newsletter';
import { productService } from '../services/productService';

const Home = () => {
  const [allProducts, setAllProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

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
    </div>
  );
};

export default Home;
