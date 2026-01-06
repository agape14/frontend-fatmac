import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import ProductCardMinimal from './ProductCardMinimal';

const ProductSection = ({ title, products, loading, error, icon = '👶', showViewAll = true, viewAllLink = '/tienda', filters = {} }) => {
  if (loading) {
    return (
      <section className="py-12">
        <div className="container mx-auto px-4 max-w-7xl">
          <div className="text-center py-16">
            <div className="text-4xl animate-bounce mb-4">{icon}</div>
            <p className="text-gray-700">Cargando productos...</p>
          </div>
        </div>
      </section>
    );
  }

  if (error) {
    return (
      <section className="py-12">
        <div className="container mx-auto px-4 max-w-7xl">
          <div className="text-center py-16">
            <p className="text-red-600 mb-4">{error}</p>
          </div>
        </div>
      </section>
    );
  }

  if (!products || products.length === 0) {
    return null;
  }

  return (
    <section className="py-12">
      <div className="container mx-auto px-4 max-w-7xl">
        {/* Título */}
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-2xl md:text-3xl font-bold text-gray-900">
            {title}
          </h2>
          {showViewAll && (
            <Link
              to={(() => {
                // Construir URL con filtros
                const params = new URLSearchParams();
                if (filters.category_id) {
                  const categoryIds = Array.isArray(filters.category_id) 
                    ? filters.category_id 
                    : [filters.category_id];
                  params.set('category_id', categoryIds.join(','));
                }
                if (filters.is_new) {
                  params.set('is_new', 'true');
                }
                if (filters.has_discount) {
                  params.set('has_discount', 'true');
                }
                const queryString = params.toString();
                return `/tienda${queryString ? `?${queryString}` : ''}`;
              })()}
              className="text-purple-pastel hover:text-purple-600 font-medium flex items-center gap-2 transition-colors"
            >
              Ver todo
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </Link>
          )}
        </div>

        {/* Grid de productos */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {products.map((product, index) => (
            <motion.div
              key={product.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: index * 0.05 }}
            >
              <ProductCardMinimal product={product} showBuyButton={true} />
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default ProductSection;
