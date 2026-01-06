import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { featuredCategoryService } from '../services/featuredCategoryService';

const CategoryBanners = () => {
  const [featuredCategories, setFeaturedCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchFeaturedCategories = async () => {
      try {
        const response = await featuredCategoryService.getAll();
        setFeaturedCategories(response.data.data || []);
      } catch (err) {
        console.error('Error loading featured categories:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchFeaturedCategories();
  }, []);

  if (loading || featuredCategories.length === 0) {
    return null;
  }

  return (
    <div className="py-12">
      <div className="container mx-auto px-4 max-w-7xl">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          {featuredCategories.map((category, index) => {
            const bgColor = category.background_color || 'from-pink-pastel to-pink-300';
            const slug = category.category?.slug || category.name.toLowerCase().replace(/\s+/g, '-');
            
            return (
              <motion.div
                key={category.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: index * 0.1 }}
                whileHover={{ y: -5 }}
              >
                <Link to={`/tienda${category.category?.id ? `?category_id=${category.category.id}` : ''}`}>
                  <div className={`bg-gradient-to-br ${bgColor} rounded-3xl p-8 text-center shadow-kawaii hover:shadow-kawaii-lg transition-all h-64 flex flex-col items-center justify-center`}>
                    {category.image_url ? (
                      <img src={category.image_url} alt={category.name} className="w-24 h-24 object-contain mb-4" />
                    ) : (
                      category.icon && <div className="text-6xl mb-4">{category.icon}</div>
                    )}
                    <h3 className={`text-2xl font-bold ${category.text_color || 'text-gray-800'} font-nunito`}>
                      {category.name}
                    </h3>
                  </div>
                </Link>
              </motion.div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default CategoryBanners;

