import { useEffect } from 'react';
import { useNavigate, useParams, useLocation } from 'react-router-dom';
import { categoryService } from '../services/categoryService';

const RedirectToTienda = ({ filters = {} }) => {
  const navigate = useNavigate();
  const params = useParams();
  const location = useLocation();

  useEffect(() => {
    const buildUrl = async () => {
      const urlParams = new URLSearchParams();
      
      // Si la ruta es /ninos o /ninas, buscar las categorías correspondientes
      if (location.pathname === '/ninos' || location.pathname === '/ninas') {
        try {
          const response = await categoryService.getAll();
          const categories = response.data.data || [];
          let targetSlugs = [];
          
          if (location.pathname === '/ninos') {
            targetSlugs = ['nino', 'bebe-nino'];
          } else if (location.pathname === '/ninas') {
            targetSlugs = ['nina', 'bebe-nina'];
          }
          
          const foundCategories = categories.filter(cat => targetSlugs.includes(cat.slug));
          const ids = foundCategories.map(cat => cat.id);
          
          if (ids.length > 0) {
            urlParams.set('category_id', ids.join(','));
          }
        } catch (err) {
          console.error('Error loading categories:', err);
        }
      }
      // Si hay un slug de categoría, buscar el ID
      else if (params.slug) {
        try {
          const response = await categoryService.getAll();
          const categories = response.data.data || [];
          const category = categories.find(cat => cat.slug === params.slug);
          if (category) {
            urlParams.set('category_id', category.id.toString());
          }
        } catch (err) {
          console.error('Error loading category:', err);
        }
      }
      
      // Agregar otros filtros
      Object.keys(filters).forEach(key => {
        if (filters[key] && key !== 'category_id') {
          if (key === 'is_new' || key === 'has_discount') {
            urlParams.set(key, 'true');
          } else {
            urlParams.set(key, filters[key].toString());
          }
        }
      });
      
      const queryString = urlParams.toString();
      navigate(`/tienda${queryString ? `?${queryString}` : ''}`, { replace: true });
    };
    
    buildUrl();
  }, [navigate, params.slug, filters, location.pathname]);

  return null;
};

export default RedirectToTienda;

