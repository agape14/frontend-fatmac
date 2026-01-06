import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import { vendorService } from '../services/vendorService';
import PrivateRoute from '../components/PrivateRoute';
import Swal from 'sweetalert2';

const AdminVendors = () => {
  const { user } = useAuth();
  const [vendors, setVendors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedStatus, setSelectedStatus] = useState('');
  const [pendingCount, setPendingCount] = useState(0);

  useEffect(() => {
    loadVendors();
    loadPendingCount();
  }, [selectedStatus]);

  const loadVendors = async () => {
    try {
      setLoading(true);
      setError(null);
      const params = selectedStatus ? { status: selectedStatus } : {};
      const response = await vendorService.getAll(params);
      setVendors(response.data.data || []);
    } catch (err) {
      setError(err.response?.data?.message || 'Error al cargar vendedores');
    } finally {
      setLoading(false);
    }
  };

  const loadPendingCount = async () => {
    try {
      const response = await vendorService.getPendingCount();
      setPendingCount(response.data.data.pending_count || 0);
    } catch (err) {
      console.error('Error loading pending count:', err);
    }
  };

  const handleStatusUpdate = async (vendorId, newStatus) => {
    try {
      await vendorService.updateStatus(vendorId, newStatus);
      loadVendors();
      loadPendingCount();
    } catch (err) {
      setError(err.response?.data?.message || 'Error al actualizar estado');
    }
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
      approved: 'bg-green-200 text-green-800',
      pending: 'bg-yellow-pastel text-yellow-800',
      rejected: 'bg-red-200 text-red-800',
    };
    const labels = {
      approved: '✅ Aprobado',
      pending: '⏳ Pendiente',
      rejected: '❌ Rechazado',
    };
    return (
      <span className={`px-3 py-1 rounded-full text-xs font-medium ${styles[status] || 'bg-gray-200 text-gray-800'}`}>
        {labels[status] || status}
      </span>
    );
  };

  return (
    <PrivateRoute requiredRole="admin">
      <div className="min-h-screen py-12 bg-gradient-to-br from-pink-pastel/20 via-purple-pastel/20 to-yellow-pastel/20">
        <div className="container mx-auto px-4 max-w-7xl">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8"
          >
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-4xl font-bold text-gray-800 mb-2 font-nunito">
                  👥 Gestión de Vendedores
                </h1>
                <p className="text-gray-600">Gestiona las solicitudes de vendedores</p>
              </div>
              {pendingCount > 0 && (
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="bg-yellow-pastel px-6 py-3 rounded-3xl shadow-kawaii"
                >
                  <p className="text-2xl font-bold text-gray-800">
                    ⏳ {pendingCount} {pendingCount === 1 ? 'solicitud pendiente' : 'solicitudes pendientes'}
                  </p>
                </motion.div>
              )}
            </div>
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
              onClick={() => setSelectedStatus('approved')}
              className={`kawaii-button ${selectedStatus === 'approved' ? 'bg-green-200 text-green-800' : 'bg-white text-gray-700'}`}
            >
              ✅ Aprobados
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

          {/* Lista de Vendedores */}
          {loading ? (
            <div className="text-center py-16">
              <div className="text-6xl animate-bounce mb-4">👥</div>
              <p className="text-gray-700">Cargando vendedores...</p>
            </div>
          ) : vendors.length === 0 ? (
            <div className="text-center py-16 kawaii-card">
              <div className="text-6xl mb-4">📭</div>
              <p className="text-gray-700 text-lg">
                No hay vendedores{selectedStatus && ` con estado "${selectedStatus}"`}
              </p>
            </div>
          ) : (
            <div className="space-y-6">
              {vendors.map((vendor, index) => (
                <motion.div
                  key={vendor.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="kawaii-card"
                >
                  <div className="grid md:grid-cols-4 gap-6 items-center">
                    {/* Información del Vendedor */}
                    <div className="md:col-span-2">
                      <div className="flex items-center justify-between mb-4">
                        <h3 className="text-xl font-bold text-gray-800">{vendor.name}</h3>
                        {getStatusBadge(vendor.status)}
                      </div>
                      <div className="space-y-2 text-sm">
                        <p>
                          <span className="font-medium">Email:</span> {vendor.email}
                        </p>
                        {vendor.phone_number && (
                          <p>
                            <span className="font-medium">Teléfono:</span> {vendor.phone_number}
                          </p>
                        )}
                        <p>
                          <span className="font-medium">Registrado:</span> {formatDate(vendor.created_at)}
                        </p>
                      </div>
                    </div>

                    {/* Estado Actual */}
                    <div className="text-center">
                      <p className="text-sm text-gray-600 mb-2">Estado Actual</p>
                      {getStatusBadge(vendor.status)}
                    </div>

                    {/* Acciones */}
                    <div className="flex flex-col gap-3">
                      {vendor.status === 'pending' && (
                        <>
                          <button
                            onClick={() => handleStatusUpdate(vendor.id, 'approved')}
                            className="kawaii-button bg-green-500 text-white hover:bg-green-600"
                          >
                            ✅ Aprobar
                          </button>
                          <button
                            onClick={async () => {
                              const result = await Swal.fire({
                                icon: 'warning',
                                title: '¿Estás seguro?',
                                html: `
                                  <p style="margin-bottom: 15px;">¿Estás seguro de rechazar a <strong>${vendor.name}</strong>?</p>
                                  <p style="color: #6b7280; font-size: 14px;">Esta acción cambiará el estado del vendedor a rechazado.</p>
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
                                handleStatusUpdate(vendor.id, 'rejected');
                              }
                            }}
                            className="kawaii-button bg-red-500 text-white hover:bg-red-600"
                          >
                            ❌ Rechazar
                          </button>
                        </>
                      )}
                      {vendor.status === 'approved' && (
                        <button
                          onClick={async () => {
                            const result = await Swal.fire({
                              icon: 'warning',
                              title: '¿Estás seguro?',
                              html: `
                                <p style="margin-bottom: 15px;">¿Estás seguro de rechazar a <strong>${vendor.name}</strong>?</p>
                                <p style="color: #6b7280; font-size: 14px;">Esta acción cambiará el estado del vendedor a rechazado.</p>
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
                              handleStatusUpdate(vendor.id, 'rejected');
                            }
                          }}
                          className="kawaii-button bg-red-500 text-white hover:bg-red-600"
                        >
                          ❌ Rechazar
                        </button>
                      )}
                      {vendor.status === 'rejected' && (
                        <button
                          onClick={() => handleStatusUpdate(vendor.id, 'approved')}
                          className="kawaii-button bg-green-500 text-white hover:bg-green-600"
                        >
                          ✅ Aprobar
                        </button>
                      )}
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </div>
    </PrivateRoute>
  );
};

export default AdminVendors;

