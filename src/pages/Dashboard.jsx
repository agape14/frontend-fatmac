import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import { dashboardService } from '../services/dashboardService';
import PrivateRoute from '../components/PrivateRoute';

const Dashboard = () => {
  const { user, isAdmin } = useAuth();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await dashboardService.getStats();
      setStats(response.data.data);
    } catch (err) {
      setError(err.response?.data?.message || 'Error al cargar estadísticas');
    } finally {
      setLoading(false);
    }
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat('es-PE', {
      style: 'currency',
      currency: 'PEN',
    }).format(price);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-pink-pastel via-purple-pastel to-yellow-pastel flex items-center justify-center">
        <div className="text-center">
          <div className="text-6xl animate-bounce mb-4">📊</div>
          <p className="text-gray-700 font-nunito">Cargando estadísticas...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-pink-pastel via-purple-pastel to-yellow-pastel flex items-center justify-center">
        <div className="kawaii-card max-w-md text-center">
          <div className="text-6xl mb-4">😢</div>
          <p className="text-gray-700 mb-4">{error}</p>
          <button
            onClick={loadStats}
            className="kawaii-button bg-purple-pastel text-white hover:bg-purple-400"
          >
            Reintentar
          </button>
        </div>
      </div>
    );
  }

  return (
    <PrivateRoute>
      <div className="min-h-screen py-12 bg-gradient-to-br from-pink-pastel/20 via-purple-pastel/20 to-yellow-pastel/20">
        <div className="container mx-auto px-4 max-w-7xl">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8"
          >
            <h1 className="text-4xl font-bold text-gray-800 mb-2 font-nunito">
              📊 Dashboard
            </h1>
            <p className="text-gray-600">
              Bienvenido, {user?.name}
            </p>
          </motion.div>

          {/* Navegación rápida */}
          <div className={`grid grid-cols-1 ${isAdmin ? 'md:grid-cols-5' : 'md:grid-cols-3'} gap-4 mb-8`}>
            {isAdmin && (
              <>
                <Link to="/admin/vendors" className="kawaii-card hover:shadow-kawaii-lg transition-all">
                  <div className="text-center">
                    <div className="text-4xl mb-2">👥</div>
                    <h3 className="font-semibold text-gray-800">Vendedores</h3>
                    <p className="text-sm text-gray-600">Gestionar vendedores</p>
                  </div>
                </Link>
                <Link to="/admin/home-cms" className="kawaii-card hover:shadow-kawaii-lg transition-all">
                  <div className="text-center">
                    <div className="text-4xl mb-2">🎨</div>
                    <h3 className="font-semibold text-gray-800">CMS Home</h3>
                    <p className="text-sm text-gray-600">Configurar home</p>
                  </div>
                </Link>
              </>
            )}
            <Link to="/dashboard/products" className="kawaii-card hover:shadow-kawaii-lg transition-all">
              <div className="text-center">
                <div className="text-4xl mb-2">📦</div>
                <h3 className="font-semibold text-gray-800">Mis Productos</h3>
                <p className="text-sm text-gray-600">Gestionar catálogo</p>
              </div>
            </Link>
            <Link to="/dashboard/orders" className="kawaii-card hover:shadow-kawaii-lg transition-all">
              <div className="text-center">
                <div className="text-4xl mb-2">🛒</div>
                <h3 className="font-semibold text-gray-800">Pedidos</h3>
                <p className="text-sm text-gray-600">Ver y gestionar pedidos</p>
              </div>
            </Link>
            <Link to="/" className="kawaii-card hover:shadow-kawaii-lg transition-all">
              <div className="text-center">
                <div className="text-4xl mb-2">🏠</div>
                <h3 className="font-semibold text-gray-800">Tienda</h3>
                <p className="text-sm text-gray-600">Ver mi tienda</p>
              </div>
            </Link>
          </div>

          {/* Estadísticas */}
          {stats && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              {/* Total de Productos */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="kawaii-card bg-gradient-to-br from-pink-pastel to-pink-300"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-700 font-medium">Total Productos</p>
                    <p className="text-3xl font-bold text-gray-800 mt-2">
                      {stats.products.total}
                    </p>
                  </div>
                  <div className="text-5xl opacity-50">📦</div>
                </div>
              </motion.div>

              {/* Productos en Stock */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="kawaii-card bg-gradient-to-br from-green-200 to-green-300"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-700 font-medium">En Stock</p>
                    <p className="text-3xl font-bold text-gray-800 mt-2">
                      {stats.products.in_stock}
                    </p>
                  </div>
                  <div className="text-5xl opacity-50">✅</div>
                </div>
              </motion.div>

              {/* Productos Sin Stock */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="kawaii-card bg-gradient-to-br from-red-200 to-red-300"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-700 font-medium">Sin Stock</p>
                    <p className="text-3xl font-bold text-gray-800 mt-2">
                      {stats.products.out_of_stock}
                    </p>
                  </div>
                  <div className="text-5xl opacity-50">⚠️</div>
                </div>
              </motion.div>

              {/* Total de Pedidos */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                className="kawaii-card bg-gradient-to-br from-purple-pastel to-purple-300"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-700 font-medium">Total Pedidos</p>
                    <p className="text-3xl font-bold text-gray-800 mt-2">
                      {stats.orders.total}
                    </p>
                  </div>
                  <div className="text-5xl opacity-50">🛒</div>
                </div>
              </motion.div>
            </div>
          )}

          {/* Estado de Pedidos */}
          {stats && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
                className="kawaii-card bg-yellow-pastel"
              >
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-gray-800">⏳ Pendientes</h3>
                  <span className="text-2xl font-bold text-gray-800">{stats.orders.pending}</span>
                </div>
                <Link
                  to="/dashboard/orders?status=pending"
                  className="text-sm text-purple-pastel hover:underline font-medium"
                >
                  Ver pedidos pendientes →
                </Link>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6 }}
                className="kawaii-card bg-green-200"
              >
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-gray-800">✅ Pagados</h3>
                  <span className="text-2xl font-bold text-gray-800">{stats.orders.paid}</span>
                </div>
                <Link
                  to="/dashboard/orders?status=paid"
                  className="text-sm text-purple-pastel hover:underline font-medium"
                >
                  Ver pedidos pagados →
                </Link>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.7 }}
                className="kawaii-card bg-red-200"
              >
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-gray-800">❌ Rechazados</h3>
                  <span className="text-2xl font-bold text-gray-800">{stats.orders.rejected}</span>
                </div>
                <Link
                  to="/dashboard/orders?status=rejected"
                  className="text-sm text-purple-pastel hover:underline font-medium"
                >
                  Ver pedidos rechazados →
                </Link>
              </motion.div>
            </div>
          )}

          {/* Ventas */}
          {stats && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.8 }}
              className="kawaii-card bg-gradient-to-r from-purple-pastel to-pink-pastel"
            >
              <h3 className="text-2xl font-bold text-gray-800 mb-4">💰 Ventas</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <p className="text-sm text-gray-700 font-medium mb-2">Total de Ventas</p>
                  <p className="text-4xl font-bold text-white">
                    {formatPrice(stats.sales.total)}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-700 font-medium mb-2">Último Mes</p>
                  <p className="text-4xl font-bold text-white">
                    {formatPrice(stats.sales.last_month)}
                  </p>
                </div>
              </div>
            </motion.div>
          )}
        </div>
      </div>
    </PrivateRoute>
  );
};

export default Dashboard;

