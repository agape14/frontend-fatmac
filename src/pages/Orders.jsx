import { useState, useEffect, useRef } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import { orderService } from '../services/orderService';
import PrivateRoute from '../components/PrivateRoute';
import Swal from 'sweetalert2';

const Orders = () => {
  const { user, isAdmin } = useAuth();
  const [searchParams] = useSearchParams();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedStatus, setSelectedStatus] = useState(searchParams.get('status') || '');
  const [selectedVoucher, setSelectedVoucher] = useState(null);
  const [totalOrders, setTotalOrders] = useState(0);
  
  // Fechas - por defecto del día actual
  const getTodayDates = () => {
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, '0');
    const day = String(today.getDate()).padStart(2, '0');
    return {
      from: `${year}-${month}-${day}`,
      to: `${year}-${month}-${day}`,
    };
  };

  const [dateFrom, setDateFrom] = useState(() => {
    const todayDates = getTodayDates();
    return searchParams.get('date_from') || todayDates.from;
  });
  const [dateTo, setDateTo] = useState(() => {
    const todayDates = getTodayDates();
    return searchParams.get('date_to') || todayDates.to;
  });
  const [dateUpdateKey, setDateUpdateKey] = useState(0); // Key para forzar re-render de inputs
  const dateFromRef = useRef(null);
  const dateToRef = useRef(null);

  useEffect(() => {
    // Cargar pedidos cuando cambian los filtros
    // Las fechas siempre están inicializadas (por defecto son de hoy)
    loadOrders();
  }, [selectedStatus, dateFrom, dateTo]);

  // Sincronizar valores de inputs cuando cambian los estados
  useEffect(() => {
    if (dateFromRef.current && dateFrom) {
      dateFromRef.current.value = dateFrom;
    }
    if (dateToRef.current && dateTo) {
      dateToRef.current.value = dateTo;
    }
  }, [dateFrom, dateTo, dateUpdateKey]);

  const loadOrders = async () => {
    try {
      setLoading(true);
      setError(null);
      const params = {};
      
      // Agregar filtro de estado solo si está seleccionado (no cuando es "Todos")
      if (selectedStatus && selectedStatus !== '') {
        params.status = selectedStatus;
      }
      
      // Agregar filtros de fecha (SIEMPRE se envían - son obligatorios)
      // Esto aplica el filtro de fecha tanto para "Todos" como para estados específicos
      // Si no hay fechas definidas, usar la fecha de hoy por defecto
      if (dateFrom) {
        params.date_from = dateFrom;
      } else {
        const todayDates = getTodayDates();
        params.date_from = todayDates.from;
      }
      
      if (dateTo) {
        params.date_to = dateTo;
      } else {
        const todayDates = getTodayDates();
        params.date_to = todayDates.to;
      }
      
      console.log('Cargando pedidos con filtros:', params);
      console.log('Fechas actuales - dateFrom:', dateFrom, 'dateTo:', dateTo);
      const response = await orderService.getVendorOrders(params);
      setOrders(response.data.data || []);
      setTotalOrders(response.data.meta?.total || 0);
      console.log('Pedidos cargados:', response.data.data?.length || 0);
      console.log('Total de pedidos (meta.total):', response.data.meta?.total || 0);
      if (response.data.data && response.data.data.length > 0) {
        console.log('Primer pedido:', {
          id: response.data.data[0].id,
          fecha: response.data.data[0].created_at,
          status: response.data.data[0].status
        });
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Error al cargar pedidos');
      console.error('Error al cargar pedidos:', err);
    } finally {
      setLoading(false);
    }
  };

  // Función auxiliar para formatear fecha en formato YYYY-MM-DD (zona horaria local)
  const formatDateLocal = (date) => {
    if (!date || !(date instanceof Date) || isNaN(date.getTime())) {
      console.error('Invalid date in formatDateLocal:', date);
      return '';
    }
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  // Funciones para establecer rangos de fechas rápidos
  const setDateRange = (range) => {
    const today = new Date();
    let from, to;

    switch (range) {
      case 'today':
        from = to = formatDateLocal(today);
        break;
      case 'week':
        const dayOfWeek = today.getDay(); // 0 = Domingo, 1 = Lunes, etc.
        // Calcular días hasta el lunes (si es domingo = 6, si es lunes = 0, si es martes = 1, etc.)
        const daysToMonday = dayOfWeek === 0 ? 6 : dayOfWeek - 1;
        // Calcular días hasta el domingo (si es domingo = 0, si es lunes = 6, si es martes = 5, etc.)
        const daysToSunday = dayOfWeek === 0 ? 0 : 7 - dayOfWeek;
        
        // Crear fecha para el lunes de esta semana
        const mondayDate = new Date(today);
        mondayDate.setDate(today.getDate() - daysToMonday);
        mondayDate.setHours(0, 0, 0, 0);
        
        // Crear fecha para el domingo de esta semana
        const sundayDate = new Date(today);
        sundayDate.setDate(today.getDate() + daysToSunday);
        sundayDate.setHours(23, 59, 59, 999);
        
        from = formatDateLocal(mondayDate);
        to = formatDateLocal(sundayDate);
        break;
      case 'month':
        // Primer día del mes actual
        const monthStart = new Date(today.getFullYear(), today.getMonth(), 1);
        // Último día del mes actual
        const monthEnd = new Date(today.getFullYear(), today.getMonth() + 1, 0);
        from = formatDateLocal(monthStart);
        to = formatDateLocal(monthEnd);
        break;
      case 'year':
        // Primer día del año actual
        const yearStart = new Date(today.getFullYear(), 0, 1);
        // Último día del año actual
        const yearEnd = new Date(today.getFullYear(), 11, 31);
        from = formatDateLocal(yearStart);
        to = formatDateLocal(yearEnd);
        break;
      default:
        return;
    }

    // Actualizar estados
    setDateFrom(from);
    setDateTo(to);
    // Forzar re-render de los inputs incrementando el key
    setDateUpdateKey(prev => prev + 1);
    
    // Forzar actualización directa de los inputs usando refs
    setTimeout(() => {
      if (dateFromRef.current) {
        dateFromRef.current.value = from;
        // Disparar evento input para forzar actualización
        dateFromRef.current.dispatchEvent(new Event('input', { bubbles: true }));
      }
      if (dateToRef.current) {
        dateToRef.current.value = to;
        // Disparar evento input para forzar actualización
        dateToRef.current.dispatchEvent(new Event('input', { bubbles: true }));
      }
    }, 0);
    
    // Debug: verificar que los valores se están estableciendo
    console.log('Rango seleccionado:', range, 'From:', from, 'To:', to);
  };

  const handleStatusUpdate = async (orderId, newStatus) => {
    try {
      await orderService.updateStatus(orderId, newStatus);
      loadOrders();
      
      // Mostrar mensaje de éxito
      Swal.fire({
        icon: 'success',
        title: 'Estado actualizado',
        text: newStatus === 'paid' ? 'El pedido ha sido marcado como pagado' : 'El pedido ha sido rechazado',
        confirmButtonText: 'Entendido',
        confirmButtonColor: '#a855f7',
        customClass: {
          popup: 'kawaii-card',
          confirmButton: 'kawaii-button bg-purple-pastel text-white hover:bg-purple-600',
        },
      });
    } catch (err) {
      setError(err.response?.data?.message || 'Error al actualizar estado');
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: err.response?.data?.message || 'Error al actualizar el estado del pedido',
        confirmButtonText: 'Entendido',
        confirmButtonColor: '#ef4444',
        customClass: {
          popup: 'kawaii-card',
          confirmButton: 'kawaii-button bg-red-500 text-white hover:bg-red-600',
        },
      });
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
            <div className="mb-4">
              <Link
                to="/dashboard"
                className="inline-flex items-center gap-2 text-purple-pastel hover:text-purple-600 font-medium mb-4 transition-colors"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                </svg>
                Volver al Dashboard
              </Link>
            </div>
            <h1 className="text-4xl font-bold text-gray-800 mb-2 font-nunito">
              🛒 Pedidos
            </h1>
            <p className="text-gray-600">
              {isAdmin ? 'Gestiona todos los pedidos del sistema' : 'Gestiona los pedidos de tus productos'}
            </p>
          </motion.div>

          {/* Filtros de Estado */}
          <div className="mb-6 flex gap-4 flex-wrap">
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

          {/* Filtros de Fecha */}
          <div className="mb-6 bg-white rounded-3xl shadow-kawaii p-6">
            <h3 className="text-lg font-bold text-gray-800 mb-4 font-nunito">Filtrar por Fecha</h3>
            
            {/* Botones rápidos */}
            <div className="mb-4 flex gap-2 flex-wrap">
              <button
                onClick={() => setDateRange('today')}
                className="kawaii-button bg-blue-100 text-blue-700 hover:bg-blue-200 text-sm"
              >
                📅 Hoy
              </button>
              <button
                onClick={() => setDateRange('week')}
                className="kawaii-button bg-blue-100 text-blue-700 hover:bg-blue-200 text-sm"
              >
                📆 Esta Semana
              </button>
              <button
                onClick={() => setDateRange('month')}
                className="kawaii-button bg-blue-100 text-blue-700 hover:bg-blue-200 text-sm"
              >
                📅 Este Mes
              </button>
              <button
                onClick={() => setDateRange('year')}
                className="kawaii-button bg-blue-100 text-blue-700 hover:bg-blue-200 text-sm"
              >
                📆 Este Año
              </button>
            </div>

            {/* Inputs de fecha */}
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Fecha Inicio
                </label>
                <input
                  ref={dateFromRef}
                  type="date"
                  value={dateFrom || ''}
                  onChange={(e) => setDateFrom(e.target.value)}
                  className="w-full kawaii-input"
                  key={`date-from-${dateUpdateKey}`}
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Fecha Fin
                </label>
                <input
                  ref={dateToRef}
                  type="date"
                  value={dateTo || ''}
                  onChange={(e) => setDateTo(e.target.value)}
                  className="w-full kawaii-input"
                  key={`date-to-${dateUpdateKey}`}
                />
              </div>
            </div>
          </div>

          {error && (
            <div className="mb-6 p-4 bg-red-100 border-2 border-red-300 rounded-3xl text-red-700">
              {error}
            </div>
          )}

          {/* Total de Pedidos */}
          {!loading && (
            <div className="mb-6 bg-white rounded-3xl shadow-kawaii p-4">
              <p className="text-lg font-semibold text-gray-800">
                Total de pedidos: <span className="text-purple-pastel text-2xl">{totalOrders}</span>
              </p>
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
              <p className="text-gray-700 text-lg">No hay pedidos{selectedStatus && ` ${selectedStatus}`}</p>
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
                          <span className="font-medium">Cliente:</span> {order.customer?.name || order.customer_name}
                        </p>
                        <p>
                          <span className="font-medium">Email:</span> {order.customer?.email || order.customer_email}
                        </p>
                        {order.customer_phone && (
                          <p>
                            <span className="font-medium">Teléfono:</span> {order.customer_phone}
                          </p>
                        )}
                        {order.customer_address && (
                          <p>
                            <span className="font-medium">Dirección:</span> {order.customer_address}
                          </p>
                        )}
                        <p>
                          <span className="font-medium">Fecha:</span> {formatDate(order.created_at)}
                        </p>
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

                    {/* Acciones */}
                    <div className="flex flex-col gap-3">
                      {order.voucher_image && (
                        <button
                          onClick={() => setSelectedVoucher(order.voucher_image)}
                          className="kawaii-button bg-blue-500 text-white hover:bg-blue-600 text-center flex items-center justify-center gap-2"
                        >
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                          </svg>
                          Ver Voucher
                        </button>
                      )}
                      {order.status === 'pending' && (
                        <>
                          <button
                            onClick={() => handleStatusUpdate(order.id, 'paid')}
                            className="kawaii-button bg-green-500 text-white hover:bg-green-600 flex items-center justify-center gap-2"
                          >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                            </svg>
                            Marcar como Pagado
                          </button>
                          <button
                            onClick={async () => {
                              const result = await Swal.fire({
                                icon: 'warning',
                                title: '¿Estás seguro?',
                                html: `
                                  <p style="margin-bottom: 15px;">¿Estás seguro de rechazar el <strong>Pedido #${order.id}</strong>?</p>
                                  <p style="color: #6b7280; font-size: 14px;">Esta acción no se puede deshacer.</p>
                                `,
                                showCancelButton: true,
                                confirmButtonText: 'Sí, rechazar',
                                cancelButtonText: 'Cancelar',
                                confirmButtonColor: '#ef4444',
                                cancelButtonColor: '#6b7280',
                                customClass: {
                                  popup: 'kawaii-card',
                                  confirmButton: 'kawaii-button bg-red-500 text-white hover:bg-red-600',
                                  cancelButton: 'kawaii-button bg-gray-400 text-white hover:bg-gray-500',
                                },
                              });
                              
                              if (result.isConfirmed) {
                                handleStatusUpdate(order.id, 'rejected');
                              }
                            }}
                            className="kawaii-button bg-red-500 text-white hover:bg-red-600 flex items-center justify-center gap-2"
                          >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                            Rechazar
                          </button>
                        </>
                      )}
                      {order.status === 'paid' && (
                        <div className="text-center text-green-600 font-medium">
                          ✅ Pedido confirmado
                        </div>
                      )}
                      {order.status === 'rejected' && (
                        <div className="text-center text-red-600 font-medium">
                          ❌ Pedido rechazado
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

      {/* Modal para mostrar el voucher */}
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

export default Orders;


