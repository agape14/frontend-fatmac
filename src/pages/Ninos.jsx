import { useState, useEffect } from 'react';
import { useProducts } from '../hooks/useProducts';
import { categoryService } from '../services/categoryService';
import ProductCardMinimal from '../components/ProductCardMinimal';
import ProductFiltersSidebar from '../components/ProductFiltersSidebar';
import Pagination from '../components/Pagination';

const Ninos = () => {
  const [filters, setFilters] = useState({});
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [categoryIds, setCategoryIds] = useState([]);

  const [categoryIdsLoaded, setCategoryIdsLoaded] = useState(false);

  // Obtener IDs de categorías relacionadas con niños: 'nino' y 'bebe-nino'
  useEffect(() => {
    const fetchCategoryIds = async () => {
      try {
        const response = await categoryService.getAll();
        const categories = response.data.data || [];
        // Buscar categorías de niños
        const ninosCategories = categories.filter(cat => 
          cat.slug === 'nino' || cat.slug === 'bebe-nino'
        );
        const ids = ninosCategories.map(cat => cat.id);
        setCategoryIds(ids);
        setCategoryIdsLoaded(true);
      } catch (err) {
        console.error('Error loading categories:', err);
        setCategoryIdsLoaded(true); // Permitir carga incluso si hay error
      }
    };
    fetchCategoryIds();
  }, []);

  // Filtrar productos de niños usando los IDs de categorías
  const apiFilters = { 
    ...filters 
  };
  
  // Si no hay filtro de categoría específico del usuario, usar las categorías de niños
  // Solo aplicar filtro si ya tenemos los IDs cargados
  if (!filters.category_id && categoryIds.length > 0 && categoryIdsLoaded) {
    apiFilters.category_id = categoryIds;
  }
  
  if (searchTerm) {
    apiFilters.search = searchTerm;
  }
  apiFilters.page = currentPage;

  // No cargar productos hasta que tengamos los categoryIds o si hay un filtro de categoría del usuario
  const shouldLoadProducts = categoryIdsLoaded || filters.category_id;
  const { products, loading, error, pagination } = useProducts(shouldLoadProducts ? apiFilters : {});

  const handleFiltersChange = (newFilters) => {
    setFilters(newFilters);
    setCurrentPage(1);
  };

  const handlePageChange = (page) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4 max-w-7xl">
        {/* Header con título y buscador */}
        <div className="mb-8 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Niños</h1>
            <p className="text-gray-600 mt-1">Ropa y accesorios para niños.</p>
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
            {(loading || !categoryIdsLoaded) && (
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

            {!loading && categoryIdsLoaded && !error && products.length === 0 && (
              <div className="text-center py-16 bg-white rounded-xl">
                <div className="text-6xl mb-4">📭</div>
                <p className="text-gray-700 text-xl">No se encontraron productos</p>
              </div>
            )}

            {!loading && categoryIdsLoaded && !error && products.length > 0 && (
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

export default Ninos;

