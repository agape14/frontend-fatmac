import { useState, useEffect } from 'react';
import { productService } from '../services/productService';

export const useProducts = (filters = {}) => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [pagination, setPagination] = useState(null);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await productService.getAll(filters);
        setProducts(response.data.data || []);
        setPagination(response.data.meta || null);
      } catch (err) {
        setError(err.response?.data?.message || 'Error al cargar productos');
        setProducts([]);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, [JSON.stringify(filters)]);

  return { products, loading, error, pagination };
};

