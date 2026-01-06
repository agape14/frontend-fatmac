import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import { orderService } from '../services/orderService';
import PrivateRoute from '../components/PrivateRoute';

const MyOrders = () => {
  const { user } = useAuth();
  const [searchParams] = useSearchParams();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedStatus, setSelectedStatus] = useState(searchParams.get('status') || '');
  const [selectedVoucher, setSelectedVoucher] = useState(null);

  useEffect(() => {
    loadOrders();
  }, [selectedStatus]);

  const loadOrders = async () => {
    try {
      setLoading(true);
      setError(null);
      const params = selectedStatus ? { status: selectedStatus } : {};
      const response = await orderService.getCustomerOrders(params);
      setOrders(response.data.data || []);
    } catch (err) {
      setError(err.response?.data?.message || 'Error al cargar pedidos');
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

  const formatDate = (dateString) => {
    if (!dateString) return '';
    
    // Las fechas ahora vienen del backend en hora local de Perú (America/Lima)
    // No necesitamos convertir la zona horaria, solo formatear
    const date = new Date(dateString);
    
    // Si la fecha es inválida, retornar string vacío
    if (isNaN(date.getTime())) return '';
    
    // Formatear en español de Perú (las fechas ya están en hora local)
    return date.toLocaleString('es-PE', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      hour12: true,
    });
  };

  const getStatusBadge = (status) => {
    const styles = {
      pending: 'bg-yellow-pastel text-yellow-800',
      paid: 'bg-green-200 text-green-800',
      rejected: 'bg-red-200 text-red-800',
    };
    return (
      <span className={`px-3 py-1 rounded-full text-xs font-medium ${styles[status] || 'bg-gray-200 text-gray-800'}`}>
        {status === 'pending' && '⏳ Pendiente'}
        {status === 'paid' && '✅ Pagado'}
        {status === 'rejected' && '❌ Rechazado'}
      </span>
    );
  };

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
              🛒 Mis Pedidos
            </h1>
            <p className="text-gray-600">Revisa el estado de tus pedidos</p>
          </motion.div>

          {/* Filtros */}
          <div className="mb-6 flex gap-4">
            <button
              onClick={() => setSelectedStatus('')}
              className={`kawaii-button ${!selectedStatus ? 'bg-purple-pastel text-white' : 'bg-white text-gray-700'}`}
            >
              Todos
            </button>
            <button
              onClick={() => setSelectedStatus('pending')}
              className={`kawaii-button ${selectedStatus === 'pending' ? 'bg-yellow-pastel text-gray-800' : 'bg-white text-gray-700'}`}
            >
              ⏳ Pendientes
            </button>
            <button
              onClick={() => setSelectedStatus('paid')}
              className={`kawaii-button ${selectedStatus === 'paid' ? 'bg-green-200 text-green-800' : 'bg-white text-gray-700'}`}
            >
              ✅ Pagados
            </button>
            <button
              onClick={() => setSelectedStatus('rejected')}
              className={`kawaii-button ${selectedStatus === 'rejected' ? 'bg-red-200 text-red-800' : 'bg-white text-gray-700'}`}
            >
              ❌ Rechazados
            </button>
          </div>

          {error && (
            <div className="mb-6 p-4 bg-red-100 border-2 border-red-300 rounded-3xl text-red-700">
              {error}
            </div>
          )}

          {/* Lista de Pedidos */}
          {loading ? (
            <div className="text-center py-16">
              <div className="text-6xl animate-bounce mb-4">🛒</div>
              <p className="text-gray-700">Cargando pedidos...</p>
            </div>
          ) : orders.length === 0 ? (
            <div className="text-center py-16 kawaii-card">
              <div className="text-6xl mb-4">📭</div>
              <p className="text-gray-700 text-lg">No tienes pedidos{selectedStatus && ` ${selectedStatus}`}</p>
              <p className="text-gray-500 mt-2">¡Comienza a comprar para ver tus pedidos aquí!</p>
            </div>
          ) : (
            <div className="space-y-6">
              {orders.map((order, index) => (
                <motion.div
                  key={order.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="kawaii-card"
                >
                  <div className="grid md:grid-cols-3 gap-6">
                    {/* Información del Pedido */}
                    <div>
                      <div className="flex items-center justify-between mb-4">
                        <h3 className="text-xl font-bold text-gray-800">Pedido #{order.id}</h3>
                        {getStatusBadge(order.status)}
                      </div>
                      <div className="space-y-2 text-sm">
                        <p>
                          <span className="font-medium">Vendedor:</span> {order.vendor?.name || 'N/A'}
                        </p>
                        <p>
                          <span className="font-medium">Fecha:</span> {formatDate(order.created_at)}
                        </p>
                        {order.payment_method && (
                          <p>
                            <span className="font-medium">Método de pago:</span> {order.payment_method === 'yape' ? 'Yape' : 'Plin'}
                          </p>
                        )}
                      </div>
                    </div>

                    {/* Información de Productos */}
                    <div>
                      <h4 className="font-semibold text-gray-800 mb-2">
                        {order.products && order.products.length > 1 ? 'Productos' : 'Producto'}
                      </h4>
                      <div className="space-y-2 max-h-48 overflow-y-auto">
                        {(order.products && order.products.length > 0 ? order.products : 
                          (order.product ? [order.product] : [])).map((product, idx) => (
                          <div key={idx} className="flex items-center gap-2 p-2 bg-gray-50 rounded-lg">
                            <div className="flex-1">
                              <p className="text-sm font-semibold text-gray-800">
                                {product.name || 'Producto no disponible'}
                              </p>
                              <p className="text-xs text-gray-600">
                                Cantidad: {product.quantity || 1} × {formatPrice(product.price || 0)}
                              </p>
                            </div>
                            <p className="text-sm font-bold text-purple-pastel">
                              {formatPrice(product.total || (product.price || 0) * (product.quantity || 1))}
                            </p>
                          </div>
                        ))}
                      </div>
                      <div className="mt-3 pt-3 border-t border-gray-200">
                        <p className="text-lg font-bold text-gray-800">
                          Total: <span className="text-2xl text-purple-pastel">{formatPrice(order.total_price)}</span>
                        </p>
                      </div>
                    </div>

                    {/* Estado y Voucher */}
                    <div className="flex flex-col gap-3">
                      <div className="text-center">
                        <p className="text-sm text-gray-600 mb-2">Estado del pedido</p>
                        {getStatusBadge(order.status)}
                      </div>
                      {order.voucher_image && (
                        <button
                          onClick={() => setSelectedVoucher(order.voucher_image)}
                          className="kawaii-button bg-blue-500 text-white hover:bg-blue-600 text-center flex items-center justify-center gap-2"
                        >
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                          </svg>
                          Ver Comprobante
                        </button>
                      )}
                      {order.status === 'pending' && (
                        <div className="text-center text-yellow-600 font-medium text-sm">
                          ⏳ Tu pedido está siendo revisado
                        </div>
                      )}
                      {order.status === 'paid' && (
                        <div className="text-center text-green-600 font-medium text-sm">
                          ✅ Tu pedido ha sido confirmado
                        </div>
                      )}
                      {order.status === 'rejected' && (
                        <div className="text-center text-red-600 font-medium text-sm">
                          ❌ Tu pedido fue rechazado. Contacta al vendedor para más información.
                        </div>
                      )}
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Modal para mostrar el comprobante */}
      <AnimatePresence>
        {selectedVoucher && (
          <>
            {/* Overlay */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedVoucher(null)}
              className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4"
            >
              {/* Modal Content */}
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                onClick={(e) => e.stopPropagation()}
                className="bg-white rounded-3xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden relative"
              >
                {/* Header */}
                <div className="bg-gradient-to-r from-blue-500 to-blue-600 text-white p-4 flex items-center justify-between">
                  <h3 className="text-xl font-bold font-nunito">Comprobante de Pago</h3>
                  <button
                    onClick={() => setSelectedVoucher(null)}
                    className="text-white hover:bg-white/20 rounded-full p-2 transition-colors"
                    aria-label="Cerrar modal"
                  >
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>

                {/* Image Container */}
                <div className="p-6 overflow-auto max-h-[calc(90vh-80px)]">
                  <div className="flex justify-center">
                    <img
                      src={selectedVoucher}
                      alt="Comprobante de pago"
                      className="max-w-full h-auto rounded-lg shadow-lg"
                    />
                  </div>
                </div>

                {/* Footer */}
                <div className="bg-gray-50 p-4 flex justify-end gap-3">
                  <button
                    onClick={() => setSelectedVoucher(null)}
                    className="kawaii-button bg-gray-200 text-gray-700 hover:bg-gray-300 px-6 py-2"
                  >
                    Cerrar
                  </button>
                  <a
                    href={selectedVoucher}
                    download
                    className="kawaii-button bg-blue-500 text-white hover:bg-blue-600 px-6 py-2 flex items-center gap-2"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                    </svg>
                    Descargar
                  </a>
                </div>
              </motion.div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </PrivateRoute>
  );
};

export default MyOrders;

