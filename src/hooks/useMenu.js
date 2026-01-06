import { useState, useEffect } from 'react';
import { menuService } from '../services/menuService';

export const useMenu = () => {
  const [menuItems, setMenuItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchMenu = async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await menuService.getAll();
        setMenuItems(response.data.data || []);
      } catch (err) {
        setError(err.response?.data?.message || 'Error al cargar el menú');
        setMenuItems([]);
      } finally {
        setLoading(false);
      }
    };

    fetchMenu();
  }, []);

  return { menuItems, loading, error };
};

