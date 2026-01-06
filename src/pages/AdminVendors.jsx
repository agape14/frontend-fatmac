import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
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
  const [editingVendor, setEditingVendor] = useState(null);
  const [editFormData, setEditFormData] = useState({
    name: '',
    phone_number: '',
    whatsapp_number: '',
    business_description: '',
    business_address: '',
  });
  const [showEditModal, setShowEditModal] = useState(false);
  const [saving, setSaving] = useState(false);

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

  const handleEditClick = (vendor) => {
    setEditingVendor(vendor);
    setEditFormData({
      name: vendor.name || '',
      phone_number: vendor.phone_number || '',
      whatsapp_number: vendor.whatsapp_number || '',
      business_description: vendor.business_description || '',
      business_address: vendor.business_address || '',
    });
    setShowEditModal(true);
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await vendorService.updateByAdmin(editingVendor.id, editFormData);
      await Swal.fire({
        icon: 'success',
        title: '¡Vendedor actualizado!',
        text: 'Los datos del vendedor se han actualizado exitosamente',
        confirmButtonText: 'Entendido',
        confirmButtonColor: '#a855f7',
        customClass: {
          popup: 'kawaii-card',
          confirmButton: 'kawaii-button bg-purple-pastel text-white hover:bg-purple-600',
        },
      });
      setShowEditModal(false);
      setEditingVendor(null);
      loadVendors();
    } catch (err) {
      console.error('Error al actualizar vendedor:', err);
      
      // Mapeo de nombres de campos a español
      const fieldNames = {
        name: 'Nombre',
        phone_number: 'Teléfono',
        whatsapp_number: 'WhatsApp',
        business_description: 'Descripción del negocio',
        business_address: 'Dirección del negocio',
      };
      
      let errorMessage = err.response?.data?.message || 'Error al actualizar vendedor. Por favor, intenta nuevamente.';
      
      if (err.response?.data?.errors) {
        const errors = err.response.data.errors;
        const errorList = Object.entries(errors)
          .map(([field, messages]) => {
            const fieldName = fieldNames[field] || field.replace(/_/g, ' ');
            const messagesArray = Array.isArray(messages) ? messages : [messages];
            const messagesText = messagesArray.join(', ');
            return `<div style="margin-bottom: 8px;"><strong style="color: #dc2626;">${fieldName}:</strong><br><span style="color: #6b7280; margin-left: 12px;">${messagesText}</span></div>`;
          })
          .join('');
        errorMessage = `<div style="text-align: left; padding: 10px;">${errorList}</div>`;
      }
      
      await Swal.fire({
        icon: 'error',
        title: 'Error al actualizar vendedor',
        html: errorMessage,
        confirmButtonText: 'Entendido',
        confirmButtonColor: '#ef4444',
        customClass: {
          popup: 'kawaii-card',
          confirmButton: 'kawaii-button bg-red-500 text-white hover:bg-red-600',
        },
      });
    } finally {
      setSaving(false);
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
                      <button
                        onClick={() => handleEditClick(vendor)}
                        className="kawaii-button bg-blue-500 text-white hover:bg-blue-600"
                      >
                        ✏️ Editar
                      </button>
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

      {/* Modal de Edición */}
      {showEditModal && editingVendor && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-3xl shadow-kawaii-lg p-8 max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto"
          >
            <h2 className="text-2xl font-bold text-gray-800 mb-6 font-nunito">
              ✏️ Editar Vendedor: {editingVendor.name}
            </h2>
            
            <form onSubmit={handleEditSubmit} className="space-y-6">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Nombre *
                </label>
                <input
                  type="text"
                  required
                  value={editFormData.name}
                  onChange={(e) => setEditFormData({ ...editFormData, name: e.target.value })}
                  className="kawaii-input w-full"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Email
                </label>
                <input
                  type="email"
                  value={editingVendor.email}
                  disabled
                  className="kawaii-input w-full bg-gray-100 cursor-not-allowed"
                />
                <p className="text-xs text-gray-500 mt-1">El email no se puede modificar</p>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Teléfono
                </label>
                <input
                  type="tel"
                  value={editFormData.phone_number}
                  onChange={(e) => setEditFormData({ ...editFormData, phone_number: e.target.value })}
                  className="kawaii-input w-full"
                  placeholder="999888777"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  WhatsApp
                </label>
                <input
                  type="tel"
                  value={editFormData.whatsapp_number}
                  onChange={(e) => setEditFormData({ ...editFormData, whatsapp_number: e.target.value })}
                  className="kawaii-input w-full"
                  placeholder="999888777"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Descripción del Negocio
                </label>
                <textarea
                  value={editFormData.business_description}
                  onChange={(e) => setEditFormData({ ...editFormData, business_description: e.target.value })}
                  className="kawaii-input w-full"
                  rows="3"
                  placeholder="Describe el negocio..."
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Dirección del Negocio
                </label>
                <input
                  type="text"
                  value={editFormData.business_address}
                  onChange={(e) => setEditFormData({ ...editFormData, business_address: e.target.value })}
                  className="kawaii-input w-full"
                  placeholder="Dirección completa..."
                />
              </div>

              <div className="flex gap-4 pt-4">
                <button
                  type="button"
                  onClick={() => {
                    setShowEditModal(false);
                    setEditingVendor(null);
                  }}
                  className="flex-1 kawaii-button bg-gray-200 text-gray-700 hover:bg-gray-300"
                  disabled={saving}
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="flex-1 kawaii-button bg-purple-pastel text-white hover:bg-purple-600 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {saving ? 'Guardando...' : 'Guardar Cambios'}
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </PrivateRoute>
  );
};

export default AdminVendors;

