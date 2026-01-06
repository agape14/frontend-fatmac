import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import { productService } from '../services/productService';
import { categoryService } from '../services/categoryService';
import PrivateRoute from '../components/PrivateRoute';
import Swal from 'sweetalert2';

const ManageProducts = () => {
  const { user } = useAuth();
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    discount_percentage: '',
    stock: '',
    condition: 'nuevo',
    category_id: '',
    image_url: '',
    is_new: true,
    is_featured: false,
  });
  const [productImages, setProductImages] = useState([]); // Array de archivos
  const [existingImages, setExistingImages] = useState([]); // Imágenes existentes al editar

  useEffect(() => {
    loadProducts();
    loadCategories();
  }, []);

  const loadProducts = async () => {
    try {
      setLoading(true);
      setError(null);
      // Obtener productos del vendedor autenticado
      const response = await productService.getAll({ vendor_id: user?.id });
      setProducts(response.data.data || []);
    } catch (err) {
      setError(err.response?.data?.message || 'Error al cargar productos');
    } finally {
      setLoading(false);
    }
  };

  const loadCategories = async () => {
    try {
      const response = await categoryService.getAll();
      setCategories(response.data.data || []);
    } catch (err) {
      console.error('Error loading categories:', err);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setError(null);
      const formDataToSend = new FormData();
      
      // Agregar campos del formulario
      Object.keys(formData).forEach(key => {
        if (formData[key] !== '' && formData[key] !== null) {
          // Convertir booleanos a strings para FormData
          if (key === 'is_new' || key === 'is_featured') {
            formDataToSend.append(key, formData[key] ? '1' : '0');
          } else {
            formDataToSend.append(key, formData[key]);
          }
        }
      });

      // Agregar nuevas imágenes
      productImages.forEach((image, index) => {
        formDataToSend.append(`images[${index}]`, image);
      });

      // Si estamos editando, agregar IDs de imágenes a eliminar
      if (editingProduct) {
        const originalImages = editingProduct.images || [];
        const imagesToDelete = originalImages
          .filter(img => !existingImages.find(ei => ei.id === img.id))
          .map(img => img.id);
        
        if (imagesToDelete.length > 0) {
          imagesToDelete.forEach((id, index) => {
            formDataToSend.append(`delete_images[${index}]`, id);
          });
        }
      }

      if (editingProduct) {
        await productService.update(editingProduct.id, formDataToSend);
      } else {
        await productService.create(formDataToSend);
      }
      
      await Swal.fire({
        icon: 'success',
        title: '¡Producto guardado!',
        text: editingProduct ? 'El producto se ha actualizado exitosamente' : 'El producto se ha creado exitosamente',
        confirmButtonText: 'Entendido',
        confirmButtonColor: '#a855f7',
        customClass: {
          popup: 'kawaii-card',
          confirmButton: 'kawaii-button bg-purple-pastel text-white hover:bg-purple-600',
        },
      });
      
      setShowModal(false);
      setEditingProduct(null);
      resetForm();
      loadProducts();
    } catch (err) {
      console.error('Error al guardar producto:', err);
      
      // Mapeo de nombres de campos a español
      const fieldNames = {
        name: 'Nombre',
        description: 'Descripción',
        price: 'Precio',
        discount_percentage: 'Porcentaje de descuento',
        stock: 'Stock',
        condition: 'Condición',
        category_id: 'Categoría',
        category: 'Categoría',
        image_url: 'URL de imagen',
        images: 'Imágenes',
        is_new: 'Nuevo',
        is_featured: 'Destacado',
      };
      
      let errorMessage = err.response?.data?.message || 'Error al guardar producto. Por favor, intenta nuevamente.';
      
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
        title: 'Error al guardar producto',
        html: errorMessage,
        confirmButtonText: 'Entendido',
        confirmButtonColor: '#ef4444',
        customClass: {
          popup: 'kawaii-card',
          confirmButton: 'kawaii-button bg-red-500 text-white hover:bg-red-600',
        },
      });
      
      setError(errorMessage);
    }
  };

  const handleEdit = (product) => {
    setEditingProduct(product);
    setFormData({
      name: product.name || '',
      description: product.description || '',
      price: product.price || '',
      discount_percentage: product.discount_percentage || '',
      stock: product.stock || '',
      condition: product.condition || 'nuevo',
      category_id: product.category_id || '',
      image_url: product.image_url || '',
      is_new: product.is_new ?? true,
      is_featured: product.is_featured ?? false,
    });
    setExistingImages(product.images || []);
    setProductImages([]);
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    const result = await Swal.fire({
      icon: 'warning',
      title: '¿Estás seguro?',
      html: `
        <p style="margin-bottom: 15px;">¿Estás seguro de eliminar este producto?</p>
        <p style="color: #6b7280; font-size: 14px;">Esta acción no se puede deshacer.</p>
      `,
      showCancelButton: true,
      confirmButtonText: 'Sí, eliminar',
      cancelButtonText: 'Cancelar',
      confirmButtonColor: '#ef4444',
      cancelButtonColor: '#6b7280',
      customClass: {
        popup: 'kawaii-card',
        confirmButton: 'kawaii-button bg-red-500 text-white hover:bg-red-600',
        cancelButton: 'kawaii-button bg-gray-400 text-white hover:bg-gray-500',
      },
    });

    if (!result.isConfirmed) {
      return;
    }

    try {
      await productService.delete(id);
      loadProducts();
    } catch (err) {
      setError(err.response?.data?.message || 'Error al eliminar producto');
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
      price: '',
      discount_percentage: '',
      stock: '',
      condition: 'nuevo',
      category_id: '',
      image_url: '',
      is_new: true,
      is_featured: false,
    });
    setProductImages([]);
    setExistingImages([]);
    setEditingProduct(null);
  };

  const handleImageChange = async (e) => {
    const files = Array.from(e.target.files);
    if (files.length > 10) {
      await Swal.fire({
        icon: 'warning',
        title: 'Límite de imágenes',
        text: 'Máximo 10 imágenes permitidas',
        confirmButtonText: 'Entendido',
        confirmButtonColor: '#a855f7',
        customClass: {
          popup: 'kawaii-card',
          confirmButton: 'kawaii-button bg-purple-pastel text-white hover:bg-purple-600',
        },
      });
      return;
    }
    setProductImages(files);
  };

  const removeExistingImage = (imageId) => {
    setExistingImages(existingImages.filter(img => img.id !== imageId));
  };

  const removeNewImage = (index) => {
    setProductImages(productImages.filter((_, i) => i !== index));
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat('es-PE', {
      style: 'currency',
      currency: 'PEN',
    }).format(price);
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
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-4xl font-bold text-gray-800 mb-2 font-nunito">
                  📦 Mis Productos
                </h1>
                <p className="text-gray-600">Gestiona tu catálogo de productos</p>
              </div>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => {
                resetForm();
                setShowModal(true);
              }}
              className="kawaii-button bg-gradient-to-r from-purple-pastel to-pink-pastel text-white"
            >
              + Nuevo Producto
            </motion.button>
            </div>
          </motion.div>

          {error && (
            <div className="mb-6 p-4 bg-red-100 border-2 border-red-300 rounded-3xl text-red-700">
              {error}
            </div>
          )}

          {/* Lista de Productos */}
          {loading ? (
            <div className="text-center py-16">
              <div className="text-6xl animate-bounce mb-4">📦</div>
              <p className="text-gray-700">Cargando productos...</p>
            </div>
          ) : products.length === 0 ? (
            <div className="text-center py-16 kawaii-card">
              <div className="text-6xl mb-4">📭</div>
              <p className="text-gray-700 text-lg mb-4">No tienes productos aún</p>
              <button
                onClick={() => {
                  resetForm();
                  setShowModal(true);
                }}
                className="kawaii-button bg-purple-pastel text-white"
              >
                Crear Primer Producto
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {products.map((product, index) => (
                <motion.div
                  key={product.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="kawaii-card"
                >
                  {(() => {
                    // Priorizar primera imagen del array, luego image_url, luego placeholder
                    let imageUrl = null;
                    if (product.images && product.images.length > 0) {
                      imageUrl = product.images[0].url || (typeof product.images[0] === 'string' ? product.images[0] : null);
                      if (!imageUrl && product.images[0].path) {
                        imageUrl = product.images[0].path;
                        imageUrl = imageUrl.startsWith('http') ? imageUrl : `${import.meta.env.VITE_API_URL}/storage/${imageUrl}`;
                      }
                    }
                    if (!imageUrl) {
                      imageUrl = product.image_url;
                    }
                    
                    return imageUrl ? (
                      <img
                        src={imageUrl}
                        alt={product.name}
                        className="w-full h-48 object-cover rounded-2xl mb-4"
                        onError={(e) => {
                          e.target.src = '/placeholder.jpg';
                        }}
                      />
                    ) : (
                      <div className="w-full h-48 bg-gradient-to-br from-pink-pastel to-purple-pastel flex items-center justify-center rounded-2xl mb-4">
                        <span className="text-6xl">🛍️</span>
                      </div>
                    );
                  })()}
                  <h3 className="text-xl font-bold text-gray-800 mb-2">{product.name}</h3>
                  <p className="text-gray-600 text-sm mb-4 line-clamp-2">
                    {product.description}
                  </p>
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-2xl font-bold text-purple-pastel">
                      {formatPrice(product.discounted_price || product.price)}
                    </span>
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                      product.stock > 0 ? 'bg-green-200 text-green-800' : 'bg-red-200 text-red-800'
                    }`}>
                      {product.stock > 0 ? `Stock: ${product.stock}` : 'Sin stock'}
                    </span>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleEdit(product)}
                      className="flex-1 kawaii-button bg-blue-500 text-white hover:bg-blue-600"
                    >
                      ✏️ Editar
                    </button>
                    <button
                      onClick={() => handleDelete(product.id)}
                      className="flex-1 kawaii-button bg-red-500 text-white hover:bg-red-600"
                    >
                      🗑️ Eliminar
                    </button>
                  </div>
                </motion.div>
              ))}
            </div>
          )}

          {/* Modal de Crear/Editar */}
          <AnimatePresence>
            {showModal && (
              <>
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  onClick={() => {
                    setShowModal(false);
                    resetForm();
                  }}
                  className="fixed inset-0 bg-black/50 z-50"
                />
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  className="fixed inset-0 z-50 flex items-center justify-center p-4"
                >
                  <div
                    onClick={(e) => e.stopPropagation()}
                    className="kawaii-card max-w-2xl w-full max-h-[90vh] overflow-y-auto"
                  >
                    <h2 className="text-2xl font-bold text-gray-800 mb-6">
                      {editingProduct ? '✏️ Editar Producto' : '➕ Nuevo Producto'}
                    </h2>
                    <form onSubmit={handleSubmit} className="space-y-6">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Nombre *
                        </label>
                        <input
                          type="text"
                          required
                          value={formData.name}
                          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                          className="kawaii-input w-full"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Descripción
                        </label>
                        <textarea
                          value={formData.description}
                          onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                          className="kawaii-input w-full"
                          rows="3"
                        />
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Precio *
                          </label>
                          <input
                            type="number"
                            step="0.01"
                            required
                            value={formData.price}
                            onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                            className="kawaii-input w-full"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Descuento (%)
                          </label>
                          <input
                            type="number"
                            step="0.01"
                            min="0"
                            max="100"
                            value={formData.discount_percentage}
                            onChange={(e) => setFormData({ ...formData, discount_percentage: e.target.value })}
                            className="kawaii-input w-full"
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Stock *
                          </label>
                          <input
                            type="number"
                            required
                            min="0"
                            value={formData.stock}
                            onChange={(e) => setFormData({ ...formData, stock: e.target.value })}
                            className="kawaii-input w-full"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Estado *
                          </label>
                          <select
                            required
                            value={formData.condition}
                            onChange={(e) => setFormData({ ...formData, condition: e.target.value })}
                            className="kawaii-input w-full"
                          >
                            <option value="nuevo">✨ Nuevo</option>
                            <option value="usado">🔄 Usado</option>
                          </select>
                        </div>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Categoría
                        </label>
                        <select
                          value={formData.category_id}
                          onChange={(e) => setFormData({ ...formData, category_id: e.target.value })}
                          className="kawaii-input w-full"
                        >
                          <option value="">Seleccionar categoría</option>
                          {categories.map((cat) => (
                            <option key={cat.id} value={cat.id}>
                              {cat.name}
                            </option>
                          ))}
                        </select>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Imágenes del Producto (máximo 10)
                        </label>
                        <input
                          type="file"
                          multiple
                          accept="image/*"
                          onChange={handleImageChange}
                          className="kawaii-input w-full"
                        />
                        {productImages.length > 0 && (
                          <div className="mt-4 grid grid-cols-4 gap-2">
                            {productImages.map((image, index) => (
                              <div key={index} className="relative">
                                <img
                                  src={URL.createObjectURL(image)}
                                  alt={`Preview ${index + 1}`}
                                  className="w-full h-24 object-cover rounded-lg"
                                />
                                <button
                                  type="button"
                                  onClick={() => removeNewImage(index)}
                                  className="absolute top-1 right-1 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs"
                                >
                                  ×
                                </button>
                              </div>
                            ))}
                          </div>
                        )}
                        {existingImages.length > 0 && (
                          <div className="mt-4">
                            <p className="text-sm text-gray-600 mb-2">Imágenes existentes:</p>
                            <div className="grid grid-cols-4 gap-2">
                              {existingImages.map((image) => (
                                <div key={image.id} className="relative">
                                  <img
                                    src={image.url}
                                    alt="Existente"
                                    className="w-full h-24 object-cover rounded-lg"
                                  />
                                  <button
                                    type="button"
                                    onClick={() => removeExistingImage(image.id)}
                                    className="absolute top-1 right-1 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs"
                                  >
                                    ×
                                  </button>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                        <div className="mt-4">
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            URL de Imagen (alternativa)
                          </label>
                          <input
                            type="url"
                            value={formData.image_url}
                            onChange={(e) => setFormData({ ...formData, image_url: e.target.value })}
                            className="kawaii-input w-full"
                            placeholder="https://..."
                          />
                          <p className="text-xs text-gray-500 mt-1">
                            Usa esto si prefieres una URL externa en lugar de subir archivos
                          </p>
                        </div>
                      </div>

                      <div className="flex gap-4">
                        <label className="flex items-center gap-2">
                          <input
                            type="checkbox"
                            checked={formData.is_new}
                            onChange={(e) => setFormData({ ...formData, is_new: e.target.checked })}
                            className="rounded"
                          />
                          <span className="text-sm text-gray-700">✨ Nuevo</span>
                        </label>
                        <label className="flex items-center gap-2">
                          <input
                            type="checkbox"
                            checked={formData.is_featured}
                            onChange={(e) => setFormData({ ...formData, is_featured: e.target.checked })}
                            className="rounded"
                          />
                          <span className="text-sm text-gray-700">⭐ Destacado</span>
                        </label>
                      </div>

                      <div className="flex gap-4">
                        <button
                          type="submit"
                          className="flex-1 kawaii-button bg-gradient-to-r from-purple-pastel to-pink-pastel text-white"
                        >
                          {editingProduct ? '💾 Guardar Cambios' : '➕ Crear Producto'}
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            setShowModal(false);
                            resetForm();
                          }}
                          className="flex-1 kawaii-button bg-gray-300 text-gray-700 hover:bg-gray-400"
                        >
                          Cancelar
                        </button>
                      </div>
                    </form>
                  </div>
                </motion.div>
              </>
            )}
          </AnimatePresence>
        </div>
      </div>
    </PrivateRoute>
  );
};

export default ManageProducts;

