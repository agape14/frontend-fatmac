import { useState, useEffect, useRef, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useProducts } from '../hooks/useProducts';
import ProductCardMinimal from '../components/ProductCardMinimal';
import ProductFiltersSidebar from '../components/ProductFiltersSidebar';
import Pagination from '../components/Pagination';

const Tienda = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [filters, setFilters] = useState(() => {
    // Inicializar filtros desde la URL al montar
    const initialFilters = {};
    const categoryId = searchParams.get('category_id');
    if (categoryId) {
      const categoryIds = categoryId.split(',').map(id => parseInt(id)).filter(id => !isNaN(id));
      if (categoryIds.length > 0) {
        initialFilters.category_id = categoryIds.length === 1 ? categoryIds[0] : categoryIds;
      }
    }
    const condition = searchParams.get('condition');
    if (condition) {
      const conditions = condition.split(',');
      initialFilters.condition = conditions.length === 1 ? conditions[0] : conditions;
    }
    const maxPrice = searchParams.get('max_price');
    if (maxPrice) {
      initialFilters.max_price = parseInt(maxPrice);
    }
    const isNew = searchParams.get('is_new');
    if (isNew === 'true') {
      initialFilters.is_new = true;
    }
    const hasDiscount = searchParams.get('has_discount');
    if (hasDiscount === 'true') {
      initialFilters.has_discount = true;
    }
    return initialFilters;
  });
  const [searchTerm, setSearchTerm] = useState(() => searchParams.get('search') || '');
  const [currentPage, setCurrentPage] = useState(() => {
    const page = searchParams.get('page');
    return page ? parseInt(page) || 1 : 1;
  });
  const isUpdatingFromInput = useRef(false); // Flag para evitar loops
  const hasInitialized = useRef(false); // Flag para saber si ya se inicializó

  // Leer parámetros de URL cuando cambian (solo después de la inicialización)
  useEffect(() => {
    if (!hasInitialized.current) {
      hasInitialized.current = true;
      return; // Ya se inicializó en el useState
    }

    // Si estamos actualizando desde el input, no leer de la URL
    if (isUpdatingFromInput.current) {
      return;
    }

    const initialFilters = {};
    
    // Leer category_id (puede ser un array o un solo valor)
    const categoryId = searchParams.get('category_id');
    if (categoryId) {
      const categoryIds = categoryId.split(',').map(id => parseInt(id)).filter(id => !isNaN(id));
      if (categoryIds.length > 0) {
        initialFilters.category_id = categoryIds.length === 1 ? categoryIds[0] : categoryIds;
      }
    }
    
    // Leer condition
    const condition = searchParams.get('condition');
    if (condition) {
      const conditions = condition.split(',');
      initialFilters.condition = conditions.length === 1 ? conditions[0] : conditions;
    }
    
    // Leer max_price
    const maxPrice = searchParams.get('max_price');
    if (maxPrice) {
      initialFilters.max_price = parseInt(maxPrice);
    }
    
    // Leer is_new
    const isNew = searchParams.get('is_new');
    if (isNew === 'true') {
      initialFilters.is_new = true;
    }
    
    // Leer has_discount
    const hasDiscount = searchParams.get('has_discount');
    if (hasDiscount === 'true') {
      initialFilters.has_discount = true;
    }
    
    // Solo actualizar filtros si realmente cambiaron
    setFilters(prevFilters => {
      const filtersChanged = JSON.stringify(prevFilters) !== JSON.stringify(initialFilters);
      if (filtersChanged) {
        return initialFilters;
      }
      return prevFilters;
    });
  }, [
    searchParams.get('category_id'),
    searchParams.get('condition'),
    searchParams.get('max_price'),
    searchParams.get('is_new'),
    searchParams.get('has_discount'),
  ]); // Solo dependencias específicas para evitar loops

  // Leer search y page de la URL solo cuando no viene del input
  useEffect(() => {
    if (isUpdatingFromInput.current) {
      return;
    }

    // Leer search
    const search = searchParams.get('search') || '';
    if (search !== searchTerm) {
      setSearchTerm(search);
    }
    
    // Leer page
    const page = searchParams.get('page');
    if (page) {
      const pageNum = parseInt(page) || 1;
      if (pageNum !== currentPage) {
        setCurrentPage(pageNum);
      }
    } else if (!search && currentPage !== 1) {
      // Solo resetear página si no hay búsqueda activa
      setCurrentPage(1);
    }
  }, [searchParams.get('search'), searchParams.get('page')]); // Solo dependencias específicas
  
  // Construir filtros para la API
  const apiFilters = useMemo(() => {
    const filtersToSend = { ...filters };
    if (searchTerm && searchTerm.trim()) {
      filtersToSend.search = searchTerm.trim();
    }
    if (currentPage > 1) {
      filtersToSend.page = currentPage;
    }
    return filtersToSend;
  }, [filters, searchTerm, currentPage]);
  
  const { products, loading, error, pagination } = useProducts(apiFilters);

  const handleFiltersChange = (newFilters) => {
    setFilters(newFilters);
    setCurrentPage(1); // Reset a página 1 cuando cambian los filtros
    
    // Actualizar URL con los nuevos filtros
    const params = new URLSearchParams();
    
    if (newFilters.category_id) {
      const categoryIds = Array.isArray(newFilters.category_id) 
        ? newFilters.category_id 
        : [newFilters.category_id];
      params.set('category_id', categoryIds.join(','));
    }
    
    if (newFilters.condition) {
      const conditions = Array.isArray(newFilters.condition)
        ? newFilters.condition
        : [newFilters.condition];
      params.set('condition', conditions.join(','));
    }
    
    if (newFilters.max_price) {
      params.set('max_price', newFilters.max_price.toString());
    }
    
    if (newFilters.is_new) {
      params.set('is_new', 'true');
    }
    
    if (newFilters.has_discount) {
      params.set('has_discount', 'true');
    }
    
    if (searchTerm) {
      params.set('search', searchTerm);
    }
    
    setSearchParams(params, { replace: true });
  };

  const handlePageChange = (page) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
    
    // Actualizar URL con la nueva página
    const params = new URLSearchParams(searchParams);
    params.set('page', page.toString());
    setSearchParams(params, { replace: true });
  };

  // Actualizar URL cuando cambia searchTerm (con debounce)
  useEffect(() => {
    // Solo actualizar si el searchTerm es diferente del que está en la URL
    const currentSearch = searchParams.get('search') || '';
    if (searchTerm === currentSearch) {
      return; // No hacer nada si ya coincide
    }

    const timeoutId = setTimeout(() => {
      isUpdatingFromInput.current = true; // Marcar que estamos actualizando desde el input
      const params = new URLSearchParams(searchParams);
      if (searchTerm && searchTerm.trim()) {
        params.set('search', searchTerm.trim());
      } else {
        params.delete('search');
      }
      params.delete('page'); // Reset página cuando cambia búsqueda
      setCurrentPage(1);
      setSearchParams(params, { replace: true });
      
      // Resetear el flag después de un delay para que los otros useEffects lo vean
      setTimeout(() => {
        isUpdatingFromInput.current = false;
      }, 200);
    }, 500); // Debounce de 500ms

    return () => clearTimeout(timeoutId);
  }, [searchTerm]); // Solo searchTerm como dependencia

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4 max-w-7xl">
        {/* Header con título y buscador */}
        <div className="mb-8 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Nuestra Colección</h1>
            <p className="text-gray-600 mt-1">Explora tesoros únicos seleccionados con amor.</p>
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
                <button
                  onClick={() => window.location.reload()}
                  className="px-4 py-2 bg-purple-pastel text-white rounded-lg hover:bg-purple-600"
                >
                  Reintentar
                </button>
              </div>
            )}

            {!loading && !error && products.length === 0 && (
              <div className="text-center py-16 bg-white rounded-xl">
                <div className="text-6xl mb-4">📭</div>
                <p className="text-gray-700 text-xl">No se encontraron productos</p>
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

export default Tienda;
