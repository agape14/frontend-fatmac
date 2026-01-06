import { useParams } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { useProducts } from '../hooks/useProducts';
import { categoryService } from '../services/categoryService';
import ProductCardMinimal from '../components/ProductCardMinimal';
import ProductFiltersSidebar from '../components/ProductFiltersSidebar';
import Pagination from '../components/Pagination';

const CategoryPage = () => {
  const { slug } = useParams();
  const [category, setCategory] = useState(null);
  const [loadingCategory, setLoadingCategory] = useState(true);
  const [filters, setFilters] = useState({});
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);

  const apiFilters = { category_slug: slug, ...filters };
  if (searchTerm) {
    apiFilters.search = searchTerm;
  }
  apiFilters.page = currentPage;

  const { products, loading, error, pagination } = useProducts(apiFilters);

  const handleFiltersChange = (newFilters) => {
    setFilters(newFilters);
    setCurrentPage(1);
  };

  const handlePageChange = (page) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  useEffect(() => {
    const fetchCategory = async () => {
      try {
        const response = await categoryService.getAll();
        const found = response.data.data.find(cat => cat.slug === slug);
        setCategory(found);
      } catch (err) {
        console.error('Error loading category:', err);
      } finally {
        setLoadingCategory(false);
      }
    };

    if (slug) {
      fetchCategory();
    }
  }, [slug]);

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4 max-w-7xl">
        {/* Header con título y buscador */}
        <div className="mb-8 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              {category?.name || slug?.replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase()) || 'Categoría'}
            </h1>
            {category?.description && (
              <p className="text-gray-600 mt-1">{category.description}</p>
            )}
          </div>
          <div className="flex items-center gap-4">
            <div className="flex-1 max-w-md">
              <input
                type="text"
                placeholder="Buscar productos..."
                value={searchTerm}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-pastel focus:border-transparent"
                onChange={(e) => {
                  setSearchTerm(e.target.value);
                  setCurrentPage(1);
                }}
              />
            </div>
            {pagination && (
              <div className="text-sm text-gray-600 whitespace-nowrap">
                Mostrando {products.length} de {pagination.total} productos
              </div>
            )}
          </div>
        </div>

        {/* Layout: Sidebar + Contenido */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Sidebar de Filtros */}
          <div className="lg:col-span-1">
            <ProductFiltersSidebar filters={filters} onFiltersChange={handleFiltersChange} />
          </div>

          {/* Contenido Principal */}
          <div className="lg:col-span-3">
            {loading && (
              <div className="text-center py-16">
                <div className="text-4xl animate-bounce mb-4">🛍️</div>
                <p className="text-gray-700">Cargando productos...</p>
              </div>
            )}

            {error && (
              <div className="text-center py-16">
                <p className="text-red-600 mb-4">{error}</p>
              </div>
            )}

            {!loading && !error && products.length === 0 && (
              <div className="text-center py-16 bg-white rounded-xl">
                <div className="text-6xl mb-4">📭</div>
                <p className="text-gray-700 text-xl">No se encontraron productos en esta categoría</p>
              </div>
            )}

            {!loading && !error && products.length > 0 && (
              <>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                  {products.map((product) => (
                    <ProductCardMinimal key={product.id} product={product} showBuyButton={true} />
                  ))}
                </div>

                {/* Paginación */}
                {pagination && pagination.last_page > 1 && (
                  <Pagination
                    currentPage={pagination.current_page}
                    lastPage={pagination.last_page}
                    onPageChange={handlePageChange}
                  />
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CategoryPage;
