import { useState, useEffect } from 'react';
import { categoryService } from '../services/categoryService';
import { vendorService } from '../services/vendorService';

const ProductFiltersSidebar = ({ filters, onFiltersChange }) => {
  const [categories, setCategories] = useState([]);
  const [vendors, setVendors] = useState([]);
  const [loadingCategories, setLoadingCategories] = useState(true);
  const [loadingVendors, setLoadingVendors] = useState(true);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await categoryService.getAll();
        setCategories(response.data.data || []);
      } catch (err) {
        console.error('Error loading categories:', err);
      } finally {
        setLoadingCategories(false);
      }
    };

    fetchCategories();

    // Cargar vendedores aprobados
    const fetchVendors = async () => {
      try {
        const response = await vendorService.getApproved();
        setVendors(response.data.data || []);
      } catch (err) {
        console.error('Error loading vendors:', err);
      } finally {
        setLoadingVendors(false);
      }
    };

    fetchVendors();
  }, []);

  const handleCategoryChange = (categoryId) => {
    const currentCategories = Array.isArray(filters.category_id) 
      ? filters.category_id 
      : filters.category_id 
        ? [filters.category_id] 
        : [];
    
    const newCategories = currentCategories.includes(categoryId)
      ? currentCategories.filter(id => id !== categoryId)
      : [...currentCategories, categoryId];
    
    onFiltersChange({
      ...filters,
      category_id: newCategories.length > 0 ? newCategories : undefined,
    });
  };

  const handleConditionChange = (condition) => {
    const currentConditions = Array.isArray(filters.condition) 
      ? filters.condition 
      : filters.condition 
        ? [filters.condition] 
        : [];
    
    const newConditions = currentConditions.includes(condition)
      ? currentConditions.filter(c => c !== condition)
      : [...currentConditions, condition];
    
    onFiltersChange({
      ...filters,
      condition: newConditions.length > 0 ? newConditions : undefined,
    });
  };

  const handlePriceChange = (maxPrice) => {
    onFiltersChange({
      ...filters,
      max_price: maxPrice || undefined,
    });
  };

  const handleVendorChange = (vendorId) => {
    const currentVendors = Array.isArray(filters.vendor_id) 
      ? filters.vendor_id 
      : filters.vendor_id 
        ? [filters.vendor_id] 
        : [];
    
    const newVendors = currentVendors.includes(vendorId)
      ? currentVendors.filter(id => id !== vendorId)
      : [...currentVendors, vendorId];
    
    onFiltersChange({
      ...filters,
      vendor_id: newVendors.length > 0 ? (newVendors.length === 1 ? newVendors[0] : newVendors) : undefined,
    });
  };

  const handleSizeChange = (size) => {
    // Tallas - esto puede ser un array o campo específico dependiendo de la estructura
    // Por ahora lo dejamos como está para implementar después
  };

  const clearFilters = () => {
    onFiltersChange({});
  };

  const currentCategories = Array.isArray(filters.category_id) 
    ? filters.category_id 
    : filters.category_id 
      ? [filters.category_id] 
      : [];
  const currentConditions = Array.isArray(filters.condition) 
    ? filters.condition 
    : filters.condition 
      ? [filters.condition] 
      : [];
  
  const currentVendors = Array.isArray(filters.vendor_id) 
    ? filters.vendor_id 
    : filters.vendor_id 
      ? [filters.vendor_id] 
      : [];

  const hasActiveFilters = 
    currentCategories.length > 0 ||
    currentConditions.length > 0 ||
    currentVendors.length > 0 ||
    filters.max_price ||
    filters.min_price;

  return (
    <div className="bg-white rounded-2xl shadow-sm p-6 sticky top-24">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-gray-800">Filtros</h3>
        {hasActiveFilters && (
          <button
            onClick={clearFilters}
            className="text-sm text-purple-pastel hover:text-purple-600 font-medium"
          >
            Limpiar
          </button>
        )}
      </div>

      {/* Categorías */}
      <div className="mb-6">
        <h4 className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
          <svg className="w-4 h-4 text-purple-pastel" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
          </svg>
          Categorías
        </h4>
        {loadingCategories ? (
          <div className="text-sm text-gray-500">Cargando...</div>
        ) : (
          <div className="space-y-2">
            {categories.map((category) => {
              const currentCategories = Array.isArray(filters.category_id) 
                ? filters.category_id 
                : filters.category_id 
                  ? [filters.category_id] 
                  : [];
              return (
                <label key={category.id} className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={currentCategories.includes(category.id)}
                    onChange={() => handleCategoryChange(category.id)}
                    className="w-4 h-4 text-purple-pastel border-gray-300 rounded focus:ring-purple-pastel"
                  />
                  <span className="text-sm text-gray-700">{category.name}</span>
                </label>
              );
            })}
          </div>
        )}
      </div>

      {/* Vendedores */}
      <div className="mb-6">
        <h4 className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
          <svg className="w-4 h-4 text-purple-pastel" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
          </svg>
          Vendedores
        </h4>
        {loadingVendors ? (
          <div className="text-sm text-gray-500">Cargando...</div>
        ) : vendors.length > 0 ? (
          <div className="space-y-2 max-h-48 overflow-y-auto">
            {vendors.map((vendor) => {
              const isChecked = currentVendors.includes(vendor.id);
              return (
                <label key={vendor.id} className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={isChecked}
                    onChange={() => handleVendorChange(vendor.id)}
                    className="w-4 h-4 text-purple-pastel border-gray-300 rounded focus:ring-purple-pastel"
                  />
                  <span className="text-sm text-gray-700">{vendor.name}</span>
                </label>
              );
            })}
          </div>
        ) : (
          <div className="text-sm text-gray-500">No hay vendedores disponibles</div>
        )}
      </div>

      {/* Estado */}
      <div className="mb-6">
        <h4 className="text-sm font-semibold text-gray-700 mb-3">Estado</h4>
        <div className="space-y-2">
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={(Array.isArray(filters.condition) ? filters.condition : filters.condition ? [filters.condition] : []).includes('nuevo')}
              onChange={() => handleConditionChange('nuevo')}
              className="w-4 h-4 text-purple-pastel border-gray-300 rounded focus:ring-purple-pastel"
            />
            <span className="text-sm text-gray-700">Nuevo</span>
          </label>
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={(Array.isArray(filters.condition) ? filters.condition : filters.condition ? [filters.condition] : []).includes('usado')}
              onChange={() => handleConditionChange('usado')}
              className="w-4 h-4 text-purple-pastel border-gray-300 rounded focus:ring-purple-pastel"
            />
            <span className="text-sm text-gray-700">Segunda Mano</span>
          </label>
        </div>
      </div>

      {/* Precio Máximo */}
      <div className="mb-6">
        <h4 className="text-sm font-semibold text-gray-700 mb-3">Precio Máximo</h4>
        <div className="space-y-3">
          <input
            type="range"
            min="0"
            max="500"
            step="10"
            value={filters.max_price || 500}
            onChange={(e) => handlePriceChange(parseInt(e.target.value))}
            className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-purple-pastel"
          />
          <div className="flex items-center justify-between text-sm text-gray-600">
            <span>S/ 0</span>
            <span className="font-semibold text-gray-800">S/ {filters.max_price || 500}</span>
            <span>S/ 500</span>
          </div>
        </div>
      </div>

      {/* Tallas - Placeholder para futura implementación */}
      {/* <div className="mb-6">
        <h4 className="text-sm font-semibold text-gray-700 mb-3">Tallas</h4>
        <div className="grid grid-cols-3 gap-2">
          {['0-3m', '3-6m', '6-12m', '1-2y', '3-4y', '5-6y'].map((size) => (
            <button
              key={size}
              className={`px-3 py-2 text-xs rounded-lg border transition-colors ${
                filters.size === size
                  ? 'bg-purple-pastel text-white border-purple-pastel'
                  : 'bg-white text-gray-700 border-gray-300 hover:border-purple-pastel'
              }`}
              onClick={() => handleSizeChange(size)}
            >
              {size}
            </button>
          ))}
        </div>
      </div> */}
    </div>
  );
};

export default ProductFiltersSidebar;

