import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import Swal from 'sweetalert2';
import { homeCmsService } from '../services/homeCmsService';
import { featuredCategoryService } from '../services/featuredCategoryService';
import { getImageUrl } from '../utils/imageUtils';

const HomeCms = () => {
  const [activeTab, setActiveTab] = useState('top-banner');
  const [loading, setLoading] = useState(false);
  const [saveLoading, setSaveLoading] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });

  // Top Banner
  const [topBanner, setTopBanner] = useState({
    text: 'ENVÍO GRATIS DESDE S/79',
    background_color: '#3B82F6',
    text_color: '#FFFFFF',
    is_active: true,
  });

  // Home Banners
  const [homeBanners, setHomeBanners] = useState([]);
  const [editingBanner, setEditingBanner] = useState(null);
  const [isCreatingBanner, setIsCreatingBanner] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [newBanner, setNewBanner] = useState({
    title: '',
    subtitle: '',
    button_text: 'VER AHORA',
    button_link: '',
    background_image_url: '',
    background_color: '#3B82F6', // Color por defecto
    order: 0,
    is_active: true,
  });

  // Newsletter Text
  const [newsletterText, setNewsletterText] = useState('');

  // Bottom Bar
  const [bottomBar, setBottomBar] = useState({
    copyright_text: 'Copyright © {year} FATMAC | Todos los derechos | Elaborado por',
    copyright_link: 'https://delacruzdev.tech/',
    background_color: '#3B82F6',
  });

  // Footer Sections
  const [footerSections, setFooterSections] = useState([]);
  const [editingFooterSection, setEditingFooterSection] = useState(null);

  // Social Links
  const [socialLinks, setSocialLinks] = useState([
    { platform: 'facebook', url: '', is_active: true },
    { platform: 'instagram', url: '', is_active: true },
    { platform: 'tiktok', url: '', is_active: true },
    { platform: 'whatsapp', url: '', is_active: true },
  ]);

  // Featured Categories
  const [featuredCategories, setFeaturedCategories] = useState([]);

  useEffect(() => {
    loadAllData();
  }, []);

  const loadAllData = async () => {
    setLoading(true);
    try {
      const [
        topBannerRes,
        bannersRes,
        newsletterRes,
        bottomBarRes,
        socialRes,
        categoriesRes,
        footerRes,
      ] = await Promise.all([
        homeCmsService.getTopBanner(),
        homeCmsService.getHomeBanners(),
        homeCmsService.getNewsletterText(),
        homeCmsService.getBottomBarSettings(),
        homeCmsService.getSocialLinks(),
        homeCmsService.getFeaturedCategories(),
        homeCmsService.getFooterSections(),
      ]);

      if (topBannerRes.data.data) setTopBanner(topBannerRes.data.data);
      if (bannersRes.data.data) setHomeBanners(bannersRes.data.data);
      if (newsletterRes.data.data?.text) setNewsletterText(newsletterRes.data.data.text);
      if (bottomBarRes.data.data) setBottomBar(bottomBarRes.data.data);
      if (socialRes.data.data) {
        const links = socialRes.data.data;
        setSocialLinks(prev => prev.map(link => {
          const found = links.find(l => l.platform === link.platform);
          return found || link;
        }));
      }
      if (categoriesRes.data.data) setFeaturedCategories(categoriesRes.data.data);
      if (footerRes.data.data) setFooterSections(footerRes.data.data);
    } catch (err) {
      showMessage('error', 'Error al cargar datos');
    } finally {
      setLoading(false);
    }
  };

  const showMessage = (type, text) => {
    setMessage({ type, text });
    setTimeout(() => setMessage({ type: '', text: '' }), 3000);
  };

  const handleSaveTopBanner = async () => {
    setSaveLoading(true);
    try {
      await homeCmsService.updateTopBanner(topBanner);
      showMessage('success', 'Banner superior actualizado');
    } catch (err) {
      showMessage('error', 'Error al actualizar');
    } finally {
      setSaveLoading(false);
    }
  };

  const handleSaveNewsletterText = async () => {
    setSaveLoading(true);
    try {
      await homeCmsService.updateNewsletterText(newsletterText);
      showMessage('success', 'Texto del newsletter actualizado');
    } catch (err) {
      showMessage('error', 'Error al actualizar');
    } finally {
      setSaveLoading(false);
    }
  };

  const handleSaveBottomBar = async () => {
    setSaveLoading(true);
    try {
      await homeCmsService.updateBottomBarSettings(bottomBar);
      showMessage('success', 'Barra inferior actualizada');
    } catch (err) {
      showMessage('error', 'Error al actualizar');
    } finally {
      setSaveLoading(false);
    }
  };

  const handleSaveSocialLink = async (platform, url) => {
    setSaveLoading(true);
    try {
      await homeCmsService.updateSocialLink({ platform, url, is_active: true });
      showMessage('success', 'Link de red social actualizado');
      loadAllData();
    } catch (err) {
      showMessage('error', 'Error al actualizar');
    } finally {
      setSaveLoading(false);
    }
  };

  const handleSaveBanner = async (banner) => {
    setSaveLoading(true);
    try {
      if (banner.id) {
        await homeCmsService.updateHomeBanner(banner.id, banner);
      } else {
        // No enviar order al crear, se calcula automáticamente en el backend
        const { order, ...bannerData } = banner;
        await homeCmsService.createHomeBanner(bannerData);
      }
      showMessage('success', 'Banner guardado');
      setEditingBanner(null);
      setIsCreatingBanner(false);
      const maxOrder = homeBanners.length > 0 
        ? Math.max(...homeBanners.map(b => b.order || 0))
        : 0;
      setNewBanner({
        title: '',
        subtitle: '',
        button_text: 'VER AHORA',
        button_link: '',
        background_image_url: '',
        background_color: '#3B82F6',
        order: maxOrder + 1,
        is_active: true,
      });
      loadAllData();
    } catch (err) {
      showMessage('error', 'Error al guardar');
    } finally {
      setSaveLoading(false);
    }
  };

  const handleDeleteBanner = async (id) => {
    if (!confirm('¿Está seguro de eliminar este banner?')) return;
    setSaveLoading(true);
    try {
      await homeCmsService.deleteHomeBanner(id);
      showMessage('success', 'Banner eliminado');
      loadAllData();
    } catch (err) {
      showMessage('error', 'Error al eliminar');
    } finally {
      setSaveLoading(false);
    }
  };

  const handleToggleCategoryVisibility = async (id, isActive) => {
    setSaveLoading(true);
    try {
      await homeCmsService.updateFeaturedCategoryVisibility(id, !isActive);
      showMessage('success', 'Visibilidad actualizada');
      loadAllData();
    } catch (err) {
      showMessage('error', 'Error al actualizar');
    } finally {
      setSaveLoading(false);
    }
  };

  const handleSaveFooterSection = async (section) => {
    setSaveLoading(true);
    try {
      if (section.id) {
        await homeCmsService.updateFooterSection(section.id, section);
      } else {
        await homeCmsService.createFooterSection(section);
      }
      showMessage('success', 'Sección del footer guardada');
      setEditingFooterSection(null);
      loadAllData();
    } catch (err) {
      showMessage('error', 'Error al guardar');
    } finally {
      setSaveLoading(false);
    }
  };

  const handleDeleteFooterSection = async (id) => {
    if (!confirm('¿Está seguro de eliminar esta sección?')) return;
    setSaveLoading(true);
    try {
      // Necesitamos agregar el método delete en el servicio
      await homeCmsService.deleteFooterSection(id);
      showMessage('success', 'Sección eliminada');
      loadAllData();
    } catch (err) {
      showMessage('error', 'Error al eliminar');
    } finally {
      setSaveLoading(false);
    }
  };

  const tabs = [
    { id: 'top-banner', label: 'Banner Superior', icon: '📢' },
    { id: 'home-banners', label: 'Banners Home', icon: '🖼️' },
    { id: 'categories', label: 'Categorías', icon: '📂' },
    { id: 'newsletter', label: 'Newsletter', icon: '📧' },
    { id: 'footer', label: 'Footer', icon: '⬇️' },
    { id: 'bottom-bar', label: 'Barra Inferior', icon: '🔵' },
    { id: 'social', label: 'Redes Sociales', icon: '🔗' },
  ];

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-pink-pastel via-purple-pastel to-yellow-pastel flex items-center justify-center">
        <div className="text-center">
          <div className="text-6xl animate-bounce mb-4">⚙️</div>
          <p className="text-gray-700 font-nunito">Cargando configuración...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-pastel via-purple-pastel to-yellow-pastel py-8">
      <div className="container mx-auto px-4 max-w-7xl">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-3xl shadow-kawaii-lg p-8"
        >
          <h1 className="text-4xl font-bold text-gray-800 mb-8 font-nunito">
            🎨 Administración del Home - CMS
          </h1>

          {message.text && (
            <div
              className={`mb-4 p-4 rounded-lg ${
                message.type === 'success' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
              }`}
            >
              {message.text}
            </div>
          )}

          {/* Tabs */}
          <div className="flex flex-wrap gap-2 mb-8 border-b-2 border-pink-pastel">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`px-6 py-3 rounded-t-lg font-semibold transition-all ${
                  activeTab === tab.id
                    ? 'bg-pink-pastel text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                <span className="mr-2">{tab.icon}</span>
                {tab.label}
              </button>
            ))}
          </div>

          {/* Tab Content */}
          <div className="mt-8">
            {/* Top Banner Tab */}
            {activeTab === 'top-banner' && (
              <div className="space-y-6">
                <h2 className="text-2xl font-bold mb-4">Banner Superior</h2>
                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium mb-2">Texto</label>
                    <input
                      type="text"
                      value={topBanner.text}
                      onChange={(e) => setTopBanner({ ...topBanner, text: e.target.value })}
                      className="w-full kawaii-input"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">Color de Fondo</label>
                    <input
                      type="color"
                      value={topBanner.background_color}
                      onChange={(e) => setTopBanner({ ...topBanner, background_color: e.target.value })}
                      className="w-full h-12 rounded-lg"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">Color del Texto</label>
                    <input
                      type="color"
                      value={topBanner.text_color}
                      onChange={(e) => setTopBanner({ ...topBanner, text_color: e.target.value })}
                      className="w-full h-12 rounded-lg"
                    />
                  </div>
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      checked={topBanner.is_active}
                      onChange={(e) => setTopBanner({ ...topBanner, is_active: e.target.checked })}
                      className="mr-2"
                    />
                    <label>Activo</label>
                  </div>
                </div>
                <button
                  onClick={handleSaveTopBanner}
                  disabled={saveLoading}
                  className="kawaii-button bg-blue-400 text-white hover:bg-blue-500"
                >
                  {saveLoading ? 'Guardando...' : 'Guardar'}
                </button>
              </div>
            )}

            {/* Home Banners Tab */}
            {activeTab === 'home-banners' && (
              <div className="space-y-6">
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-2xl font-bold">Banners del Home</h2>
                  <button
                    onClick={() => {
                      setEditingBanner(null);
                      setIsCreatingBanner(true);
                      // Calcular orden automáticamente
                      const maxOrder = homeBanners.length > 0 
                        ? Math.max(...homeBanners.map(b => b.order || 0))
                        : 0;
                      setNewBanner({
                        title: '',
                        subtitle: '',
                        button_text: 'VER AHORA',
                        button_link: '',
                        background_image_url: '',
                        background_color: '#3B82F6',
                        order: maxOrder + 1,
                        is_active: true,
                      });
                    }}
                    className="kawaii-button bg-green-400 text-white hover:bg-green-500"
                  >
                    + Nuevo Banner
                  </button>
                </div>

                {editingBanner === null && !isCreatingBanner && (
                  <div className="grid gap-4">
                    {homeBanners.length === 0 && (
                      <p className="text-gray-600 text-center py-8">No hay banners creados. Crea uno nuevo para comenzar.</p>
                    )}
                    {homeBanners.map((banner) => (
                      <div key={banner.id} className="border rounded-lg p-4">
                        <div className="flex justify-between items-start">
                          <div className="flex-1">
                            <h3 className="font-bold">{banner.title || banner.subtitle || 'Banner sin título'}</h3>
                            <p className="text-sm text-gray-600">Orden: {banner.order}</p>
                            {banner.background_image_url && (
                              <p className="text-xs text-gray-500">Con imagen de fondo</p>
                            )}
                          </div>
                          <div className="flex gap-2">
                            <button
                              onClick={() => {
                                setEditingBanner(banner);
                                setIsCreatingBanner(false);
                              }}
                              className="px-4 py-2 bg-blue-400 text-white rounded-lg hover:bg-blue-500"
                            >
                              Editar
                            </button>
                            <button
                              onClick={() => handleDeleteBanner(banner.id)}
                              className="px-4 py-2 bg-red-400 text-white rounded-lg hover:bg-red-500"
                            >
                              Eliminar
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {(editingBanner !== null || isCreatingBanner) && (
                  <div className="border rounded-lg p-6 bg-gray-50">
                    <h3 className="text-xl font-bold mb-4">
                      {editingBanner ? 'Editar Banner' : 'Nuevo Banner'}
                    </h3>
                    <div className="grid md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium mb-2">Título (Colección)</label>
                        <input
                          type="text"
                          value={editingBanner?.title || newBanner.title}
                          onChange={(e) => {
                            if (editingBanner) {
                              setEditingBanner({ ...editingBanner, title: e.target.value });
                            } else {
                              setNewBanner({ ...newBanner, title: e.target.value });
                            }
                          }}
                          className="w-full kawaii-input"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium mb-2">Subtítulo (VESTIDOS)</label>
                        <input
                          type="text"
                          value={editingBanner?.subtitle || newBanner.subtitle}
                          onChange={(e) => {
                            if (editingBanner) {
                              setEditingBanner({ ...editingBanner, subtitle: e.target.value });
                            } else {
                              setNewBanner({ ...newBanner, subtitle: e.target.value });
                            }
                          }}
                          className="w-full kawaii-input"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium mb-2">Texto del Botón</label>
                        <input
                          type="text"
                          value={editingBanner?.button_text || newBanner.button_text}
                          onChange={(e) => {
                            if (editingBanner) {
                              setEditingBanner({ ...editingBanner, button_text: e.target.value });
                            } else {
                              setNewBanner({ ...newBanner, button_text: e.target.value });
                            }
                          }}
                          className="w-full kawaii-input"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium mb-2">Link del Botón</label>
                        <input
                          type="text"
                          value={editingBanner?.button_link || newBanner.button_link}
                          onChange={(e) => {
                            if (editingBanner) {
                              setEditingBanner({ ...editingBanner, button_link: e.target.value });
                            } else {
                              setNewBanner({ ...newBanner, button_link: e.target.value });
                            }
                          }}
                          className="w-full kawaii-input"
                          placeholder="/tienda"
                        />
                      </div>
                      <div className="md:col-span-2">
                        <label className="block text-sm font-medium mb-2">Imagen de Fondo</label>
                        <p className="text-xs text-gray-500 mb-2">
                          <strong>Recomendado:</strong> 1920x800px (ratio 2.4:1) - Formato: JPEG, PNG, JPG, GIF, WEBP - Máximo: 5MB
                        </p>
                        <div className="flex gap-2">
                          <input
                            type="file"
                            accept="image/*"
                            onChange={async (e) => {
                              const file = e.target.files[0];
                              if (file) {
                                // Validar tipo de archivo
                                const validTypes = ['image/jpeg', 'image/png', 'image/jpg', 'image/gif', 'image/webp'];
                                if (!validTypes.includes(file.type)) {
                                  await Swal.fire({
                                    icon: 'error',
                                    title: 'Tipo de archivo no válido',
                                    text: 'Por favor, selecciona una imagen en formato: JPEG, PNG, JPG, GIF o WEBP',
                                    confirmButtonText: 'Entendido',
                                    confirmButtonColor: '#a855f7',
                                    customClass: {
                                      popup: 'kawaii-card',
                                      confirmButton: 'kawaii-button bg-purple-pastel text-white hover:bg-purple-600',
                                    },
                                  });
                                  e.target.value = ''; // Limpiar el input
                                  return;
                                }

                                // Validar tamaño (5MB máximo)
                                if (file.size > 5 * 1024 * 1024) {
                                  await Swal.fire({
                                    icon: 'error',
                                    title: 'Archivo demasiado grande',
                                    text: 'La imagen no debe ser mayor a 5MB',
                                    confirmButtonText: 'Entendido',
                                    confirmButtonColor: '#a855f7',
                                    customClass: {
                                      popup: 'kawaii-card',
                                      confirmButton: 'kawaii-button bg-purple-pastel text-white hover:bg-purple-600',
                                    },
                                  });
                                  e.target.value = ''; // Limpiar el input
                                  return;
                                }

                                setUploadingImage(true);
                                try {
                                  const response = await homeCmsService.uploadBannerImage(file);
                                  const imageUrl = response.data.data.url;
                                  if (editingBanner) {
                                    setEditingBanner({ ...editingBanner, background_image_url: imageUrl });
                                  } else {
                                    setNewBanner({ ...newBanner, background_image_url: imageUrl });
                                  }
                                  
                                  // Mostrar advertencias si las hay
                                  if (response.data.warnings && response.data.warnings.length > 0) {
                                    await Swal.fire({
                                      icon: 'warning',
                                      title: 'Imagen subida con advertencias',
                                      html: `
                                        <p class="mb-2">La imagen se subió correctamente, pero:</p>
                                        <ul class="text-left list-disc list-inside mb-4">
                                          ${response.data.warnings.map(w => `<li>${w}</li>`).join('')}
                                        </ul>
                                        <p class="text-sm text-gray-600"><strong>Recomendado:</strong> 1920x800px (ratio 2.4:1)</p>
                                      `,
                                      confirmButtonText: 'Entendido',
                                      confirmButtonColor: '#a855f7',
                                      customClass: {
                                        popup: 'kawaii-card',
                                        confirmButton: 'kawaii-button bg-purple-pastel text-white hover:bg-purple-600',
                                      },
                                    });
                                  } else {
                                    await Swal.fire({
                                      icon: 'success',
                                      title: '¡Imagen subida!',
                                      text: 'La imagen se ha subido correctamente',
                                      confirmButtonText: 'Perfecto',
                                      confirmButtonColor: '#a855f7',
                                      timer: 2000,
                                      timerProgressBar: true,
                                      customClass: {
                                        popup: 'kawaii-card',
                                        confirmButton: 'kawaii-button bg-purple-pastel text-white hover:bg-purple-600',
                                      },
                                    });
                                  }
                                } catch (err) {
                                  const errorMessage = err.response?.data?.message || 'Error al subir imagen';
                                  const errorDetails = err.response?.data?.errors;
                                  
                                  let errorText = errorMessage;
                                  if (errorDetails && errorDetails.image) {
                                    errorText = Array.isArray(errorDetails.image) 
                                      ? errorDetails.image.join(', ')
                                      : errorDetails.image;
                                  }

                                  await Swal.fire({
                                    icon: 'error',
                                    title: 'Error al subir imagen',
                                    html: `<p>${errorText}</p>`,
                                    confirmButtonText: 'Entendido',
                                    confirmButtonColor: '#a855f7',
                                    customClass: {
                                      popup: 'kawaii-card',
                                      confirmButton: 'kawaii-button bg-purple-pastel text-white hover:bg-purple-600',
                                    },
                                  });
                                } finally {
                                  setUploadingImage(false);
                                  e.target.value = ''; // Limpiar el input después de subir
                                }
                              }
                            }}
                            className="flex-1 kawaii-input"
                            disabled={uploadingImage}
                          />
                          {uploadingImage && (
                            <span className="text-sm text-gray-500 self-center">Subiendo...</span>
                          )}
                        </div>
                        <input
                          type="url"
                          value={editingBanner?.background_image_url || newBanner.background_image_url}
                          onChange={(e) => {
                            if (editingBanner) {
                              setEditingBanner({ ...editingBanner, background_image_url: e.target.value });
                            } else {
                              setNewBanner({ ...newBanner, background_image_url: e.target.value });
                            }
                          }}
                          className="w-full kawaii-input mt-2"
                          placeholder="O ingresa una URL de imagen"
                        />
                        {(editingBanner?.background_image_url || newBanner.background_image_url) && (
                          <div className="mt-2">
                            <img 
                              src={getImageUrl(editingBanner?.background_image_url || newBanner.background_image_url)} 
                              alt="Preview" 
                              className="w-full h-32 object-cover rounded-lg border"
                              onError={(e) => {
                                e.target.style.display = 'none';
                                console.error('Error loading image:', editingBanner?.background_image_url || newBanner.background_image_url);
                              }}
                            />
                          </div>
                        )}
                      </div>
                      <div>
                        <label className="block text-sm font-medium mb-2">Color de Fondo (si no hay imagen)</label>
                        <div className="flex gap-2">
                          <input
                            type="color"
                            value={editingBanner?.background_color || newBanner.background_color || '#3B82F6'}
                            onChange={(e) => {
                              if (editingBanner) {
                                setEditingBanner({ ...editingBanner, background_color: e.target.value });
                              } else {
                                setNewBanner({ ...newBanner, background_color: e.target.value });
                              }
                            }}
                            className="w-16 h-12 rounded-lg border cursor-pointer"
                          />
                          <input
                            type="text"
                            value={editingBanner?.background_color || newBanner.background_color}
                            onChange={(e) => {
                              if (editingBanner) {
                                setEditingBanner({ ...editingBanner, background_color: e.target.value });
                              } else {
                                setNewBanner({ ...newBanner, background_color: e.target.value });
                              }
                            }}
                            className="flex-1 kawaii-input"
                            placeholder="#3B82F6 o from-pink-pastel to-purple-pastel"
                          />
                        </div>
                        <p className="text-xs text-gray-500 mt-1">
                          Puedes usar un color hexadecimal (#3B82F6) o clases de Tailwind (from-pink-pastel to-purple-pastel)
                        </p>
                      </div>
                      <div>
                        <label className="block text-sm font-medium mb-2">
                          Orden {isCreatingBanner && '(Autoincremental)'}
                        </label>
                        <input
                          type="number"
                          value={editingBanner?.order ?? newBanner.order}
                          onChange={(e) => {
                            if (editingBanner) {
                              setEditingBanner({ ...editingBanner, order: parseInt(e.target.value) || 0 });
                            } else {
                              setNewBanner({ ...newBanner, order: parseInt(e.target.value) || 0 });
                            }
                          }}
                          className="w-full kawaii-input"
                          disabled={isCreatingBanner}
                        />
                        {isCreatingBanner && (
                          <p className="text-xs text-gray-500 mt-1">
                            El orden se asigna automáticamente. Puedes editarlo después de crear el banner.
                          </p>
                        )}
                      </div>
                    </div>
                    <div className="flex gap-4 mt-4">
                      <button
                        onClick={() => handleSaveBanner(editingBanner || newBanner)}
                        disabled={saveLoading}
                        className="kawaii-button bg-blue-400 text-white hover:bg-blue-500"
                      >
                        {saveLoading ? 'Guardando...' : 'Guardar'}
                      </button>
                      <button
                        onClick={() => {
                          setEditingBanner(null);
                          setIsCreatingBanner(false);
                          const maxOrder = homeBanners.length > 0 
                            ? Math.max(...homeBanners.map(b => b.order || 0))
                            : 0;
                          setNewBanner({
                            title: '',
                            subtitle: '',
                            button_text: 'VER AHORA',
                            button_link: '',
                            background_image_url: '',
                            background_color: '#3B82F6',
                            order: maxOrder + 1,
                            is_active: true,
                          });
                        }}
                        className="kawaii-button bg-gray-400 text-white hover:bg-gray-500"
                      >
                        Cancelar
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Categories Tab */}
            {activeTab === 'categories' && (
              <div className="space-y-6">
                <h2 className="text-2xl font-bold mb-4">Categorías Destacadas</h2>
                <p className="text-gray-600 mb-4">
                  Selecciona qué categorías mostrar en el home marcando/desmarcando el checkbox.
                </p>
                <div className="grid gap-4">
                  {featuredCategories.map((category) => (
                    <div key={category.id} className="border rounded-lg p-4 flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        {category.icon && <span className="text-4xl">{category.icon}</span>}
                        <div>
                          <h3 className="font-bold">{category.name}</h3>
                          <p className="text-sm text-gray-600">Orden: {category.order}</p>
                        </div>
                      </div>
                      <label className="flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          checked={category.is_active}
                          onChange={() => handleToggleCategoryVisibility(category.id, category.is_active)}
                          className="mr-2 w-5 h-5"
                        />
                        <span className={category.is_active ? 'text-green-600 font-semibold' : 'text-gray-400'}>
                          {category.is_active ? 'Visible' : 'Oculta'}
                        </span>
                      </label>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Newsletter Tab */}
            {activeTab === 'newsletter' && (
              <div className="space-y-6">
                <h2 className="text-2xl font-bold mb-4">Texto del Newsletter</h2>
                <div>
                  <label className="block text-sm font-medium mb-2">Texto de Suscripción</label>
                  <textarea
                    value={newsletterText}
                    onChange={(e) => setNewsletterText(e.target.value)}
                    className="w-full kawaii-input"
                    rows="3"
                  />
                </div>
                <button
                  onClick={handleSaveNewsletterText}
                  disabled={saveLoading}
                  className="kawaii-button bg-blue-400 text-white hover:bg-blue-500"
                >
                  {saveLoading ? 'Guardando...' : 'Guardar'}
                </button>
              </div>
            )}

            {/* Bottom Bar Tab */}
            {activeTab === 'bottom-bar' && (
              <div className="space-y-6">
                <h2 className="text-2xl font-bold mb-4">Barra Inferior</h2>
                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium mb-2">Texto de Copyright</label>
                    <textarea
                      value={bottomBar.copyright_text}
                      onChange={(e) => setBottomBar({ ...bottomBar, copyright_text: e.target.value })}
                      className="w-full kawaii-input"
                      rows="3"
                      placeholder="Copyright © {year} FATMAC | Todos los derechos | Elaborado por"
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      Usa {'{year}'} para el año dinámico. El texto "Elaborado por" se mostrará con el link configurado abajo.
                    </p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">Link del Copyright</label>
                    <input
                      type="url"
                      value={bottomBar.copyright_link}
                      onChange={(e) => setBottomBar({ ...bottomBar, copyright_link: e.target.value })}
                      className="w-full kawaii-input"
                      placeholder="https://delacruzdev.tech/"
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      Link que aparecerá después de "Elaborado por"
                    </p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">Color de Fondo</label>
                    <input
                      type="color"
                      value={bottomBar.background_color}
                      onChange={(e) => setBottomBar({ ...bottomBar, background_color: e.target.value })}
                      className="w-full h-12 rounded-lg"
                    />
                  </div>
                </div>
                <button
                  onClick={handleSaveBottomBar}
                  disabled={saveLoading}
                  className="kawaii-button bg-blue-400 text-white hover:bg-blue-500"
                >
                  {saveLoading ? 'Guardando...' : 'Guardar'}
                </button>
              </div>
            )}

            {/* Social Links Tab */}
            {activeTab === 'social' && (
              <div className="space-y-6">
                <h2 className="text-2xl font-bold mb-4">Redes Sociales</h2>
                <div className="grid gap-4">
                  {socialLinks.map((link) => (
                    <div key={link.platform} className="border rounded-lg p-4">
                      <div className="flex items-center gap-4 mb-4">
                        <span className="text-2xl">
                          {link.platform === 'facebook' && '📘'}
                          {link.platform === 'instagram' && '📷'}
                          {link.platform === 'tiktok' && '🎵'}
                          {link.platform === 'whatsapp' && '💬'}
                        </span>
                        <h3 className="font-bold capitalize">{link.platform}</h3>
                      </div>
                      <div className="flex gap-2">
                        <input
                          type="url"
                          value={link.url || ''}
                          onChange={(e) => {
                            const updated = socialLinks.map(l =>
                              l.platform === link.platform ? { ...l, url: e.target.value } : l
                            );
                            setSocialLinks(updated);
                          }}
                          className="flex-1 kawaii-input"
                          placeholder="https://..."
                        />
                        <button
                          onClick={() => {
                            const linkToSave = socialLinks.find(l => l.platform === link.platform);
                            handleSaveSocialLink(link.platform, linkToSave.url);
                          }}
                          disabled={saveLoading}
                          className="kawaii-button bg-blue-400 text-white hover:bg-blue-500"
                        >
                          Guardar
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Footer Tab */}
            {activeTab === 'footer' && (
              <div className="space-y-6">
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-2xl font-bold">Secciones del Footer</h2>
                  <button
                    onClick={() => {
                      const newSection = {
                        position: footerSections.length + 1,
                        title: '',
                        content: '',
                        logo_url: '',
                        description: '',
                        phone: '',
                        email: '',
                        address: '',
                        links: [],
                        is_active: true,
                      };
                      setEditingFooterSection(newSection);
                    }}
                    className="kawaii-button bg-green-400 text-white hover:bg-green-500"
                  >
                    + Nueva Sección
                  </button>
                </div>

                {editingFooterSection === null && (
                  <div className="grid gap-4">
                    {footerSections.length === 0 && (
                      <p className="text-gray-600 text-center py-8">No hay secciones creadas. Crea una nueva para comenzar.</p>
                    )}
                    {footerSections.map((section) => (
                      <div key={section.id} className="border rounded-lg p-4">
                        <div className="flex justify-between items-start">
                          <div className="flex-1">
                            <h3 className="font-bold">Sección {section.position}: {section.title || 'Sin título'}</h3>
                            {section.description && (
                              <p className="text-sm text-gray-600 mt-1">{section.description.substring(0, 100)}...</p>
                            )}
                            {section.links && Array.isArray(section.links) && section.links.length > 0 && (
                              <p className="text-xs text-gray-500 mt-1">{section.links.length} enlaces</p>
                            )}
                          </div>
                          <div className="flex gap-2">
                            <button
                              onClick={() => setEditingFooterSection(section)}
                              className="px-4 py-2 bg-blue-400 text-white rounded-lg hover:bg-blue-500"
                            >
                              Editar
                            </button>
                            <button
                              onClick={() => handleDeleteFooterSection(section.id)}
                              className="px-4 py-2 bg-red-400 text-white rounded-lg hover:bg-red-500"
                            >
                              Eliminar
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {editingFooterSection !== null && (
                  <div className="border rounded-lg p-6 bg-gray-50">
                    <h3 className="text-xl font-bold mb-4">
                      {editingFooterSection.id ? 'Editar Sección' : 'Nueva Sección'}
                    </h3>
                    <div className="grid md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium mb-2">Posición (1-4)</label>
                        <input
                          type="number"
                          min="1"
                          max="4"
                          value={editingFooterSection.position || 1}
                          onChange={(e) => setEditingFooterSection({ ...editingFooterSection, position: parseInt(e.target.value) })}
                          className="w-full kawaii-input"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium mb-2">Título</label>
                        <input
                          type="text"
                          value={editingFooterSection.title || ''}
                          onChange={(e) => setEditingFooterSection({ ...editingFooterSection, title: e.target.value })}
                          className="w-full kawaii-input"
                        />
                      </div>
                      <div className="md:col-span-2">
                        <label className="block text-sm font-medium mb-2">Descripción</label>
                        <textarea
                          value={editingFooterSection.description || ''}
                          onChange={(e) => setEditingFooterSection({ ...editingFooterSection, description: e.target.value })}
                          className="w-full kawaii-input"
                          rows="3"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium mb-2">URL del Logo</label>
                        <input
                          type="url"
                          value={editingFooterSection.logo_url || ''}
                          onChange={(e) => setEditingFooterSection({ ...editingFooterSection, logo_url: e.target.value })}
                          className="w-full kawaii-input"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium mb-2">Teléfono</label>
                        <input
                          type="text"
                          value={editingFooterSection.phone || ''}
                          onChange={(e) => setEditingFooterSection({ ...editingFooterSection, phone: e.target.value })}
                          className="w-full kawaii-input"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium mb-2">Email</label>
                        <input
                          type="email"
                          value={editingFooterSection.email || ''}
                          onChange={(e) => setEditingFooterSection({ ...editingFooterSection, email: e.target.value })}
                          className="w-full kawaii-input"
                        />
                      </div>
                      <div className="md:col-span-2">
                        <label className="block text-sm font-medium mb-2">Dirección</label>
                        <textarea
                          value={editingFooterSection.address || ''}
                          onChange={(e) => setEditingFooterSection({ ...editingFooterSection, address: e.target.value })}
                          className="w-full kawaii-input"
                          rows="2"
                        />
                      </div>
                      <div className="md:col-span-2">
                        <label className="block text-sm font-medium mb-2">Enlaces (JSON array)</label>
                        <textarea
                          value={JSON.stringify(editingFooterSection.links || [], null, 2)}
                          onChange={(e) => {
                            try {
                              const links = JSON.parse(e.target.value);
                              setEditingFooterSection({ ...editingFooterSection, links });
                            } catch (err) {
                              // Si no es JSON válido, guardar como texto
                            }
                          }}
                          className="w-full kawaii-input font-mono text-sm"
                          rows="6"
                          placeholder='[{"text": "Envíos", "url": "/envios"}, {"text": "Cambios y devoluciones", "url": "/cambios-devoluciones"}]'
                        />
                        <p className="text-xs text-gray-500 mt-1">
                          Formato: Array de objetos con propiedades "text" y "url"
                        </p>
                      </div>
                      <div className="flex items-center">
                        <input
                          type="checkbox"
                          checked={editingFooterSection.is_active !== false}
                          onChange={(e) => setEditingFooterSection({ ...editingFooterSection, is_active: e.target.checked })}
                          className="mr-2"
                        />
                        <label>Activa</label>
                      </div>
                    </div>
                    <div className="flex gap-4 mt-4">
                      <button
                        onClick={() => handleSaveFooterSection(editingFooterSection)}
                        disabled={saveLoading}
                        className="kawaii-button bg-blue-400 text-white hover:bg-blue-500"
                      >
                        {saveLoading ? 'Guardando...' : 'Guardar'}
                      </button>
                      <button
                        onClick={() => setEditingFooterSection(null)}
                        className="kawaii-button bg-gray-400 text-white hover:bg-gray-500"
                      >
                        Cancelar
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default HomeCms;

