import { Link, useLocation, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useState, useEffect, useRef } from 'react';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import CartSidebar from './CartSidebar';
import TopBar from './TopBar';
import { settingsService } from '../services/settingsService';

const Header = () => {
  const location = useLocation();
  const navigate = useNavigate();
  // Menú simplificado: Solo Tienda, Niños, Niñas
  const menuItems = [
    { id: 1, label: 'Tienda', path: '/tienda', slug: 'tienda', icon: '🛍️' },
    { id: 2, label: 'Niños', path: '/ninos', slug: 'ninos', icon: '👦' },
    { id: 3, label: 'Niñas', path: '/ninas', slug: 'ninas', icon: '👧' },
  ];
  const menuLoading = false;
  const { getCartCount, isCartOpen, setIsCartOpen } = useCart();
  const { user, isAuthenticated, logout, isAdmin, isVendor } = useAuth();
  const cartCount = getCartCount();
  const [showUserMenu, setShowUserMenu] = useState(false);
  const userMenuRef = useRef(null);
  const [logoUrl, setLogoUrl] = useState('/logo-fatmac.png');
  const [logoKey, setLogoKey] = useState(0); // Key para forzar recarga de imagen

  // Función para corregir la URL del logo (igual que en LogoSettings)
  const getFullLogoUrl = (url) => {
    if (!url) return '/logo-fatmac.png';
    
    // Si ya es una URL absoluta completa
    if (url.startsWith('http://') || url.startsWith('https://')) {
      // En desarrollo local, corregir localhost sin puerto a localhost:8000
      if (url.startsWith('http://localhost/') && !url.startsWith('http://localhost:')) {
        return url.replace('http://localhost/', 'http://localhost:8000/');
      }
      // En producción, dejar la URL tal cual
      return url;
    }
    
    // Si es relativa, construir usando la URL base de la API
    const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:8000/api';
    const baseUrl = apiUrl.replace('/api', '');
    return `${baseUrl}${url.startsWith('/') ? '' : '/'}${url}`;
  };

  // Cargar logo desde settings
  const loadLogo = async (forceUpdate = false) => {
    try {
      const response = await settingsService.get('logo_url');
      const url = response.data.data?.value;
      if (url) {
        // Corregir la URL
        const fullUrl = getFullLogoUrl(url);
        // Solo agregar timestamp si es una actualización forzada (cuando cambia el logo)
        const urlWithCache = forceUpdate 
          ? (fullUrl.includes('?') ? `${fullUrl}&t=${Date.now()}` : `${fullUrl}?t=${Date.now()}`)
          : fullUrl;
        
        setLogoUrl(urlWithCache);
        
        // Solo actualizar el key si es una actualización forzada
        if (forceUpdate) {
          setLogoKey(prev => prev + 1);
          console.log('Header - Logo actualizado:', urlWithCache);
        }
      } else {
        // Si no hay logo, usar el por defecto
        setLogoUrl('/logo-fatmac.png');
      }
    } catch (error) {
      console.error('Error al cargar logo:', error);
      // Mantener el logo por defecto
      setLogoUrl('/logo-fatmac.png');
    }
  };

  useEffect(() => {
    // Cargar logo solo una vez al montar el componente
    loadLogo();
    
    // Escuchar evento personalizado cuando el logo cambia desde el Dashboard
    const handleLogoUpdate = () => {
      console.log('Header - Evento logoUpdated recibido, recargando logo...');
      // Esperar un poco para asegurar que el backend haya guardado el cambio
      // Pasar forceUpdate=true para forzar la recarga de la imagen
      setTimeout(() => {
        loadLogo(true);
      }, 500);
    };
    
    window.addEventListener('logoUpdated', handleLogoUpdate);
    
    return () => {
      window.removeEventListener('logoUpdated', handleLogoUpdate);
    };
  }, []);

  const handleLogout = async () => {
    await logout();
    setShowUserMenu(false);
    // Redirigir al home después de cerrar sesión
    navigate('/', { replace: true });
  };

  // Cerrar menú cuando se hace clic fuera
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (userMenuRef.current && !userMenuRef.current.contains(event.target)) {
        setShowUserMenu(false);
      }
    };

    if (showUserMenu) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showUserMenu]);

  const handleWhatsAppClick = async () => {
    // Cargar número desde configuración
    let phoneNumber = import.meta.env.VITE_WHATSAPP_NUMBER || '999999999';
    try {
      const { settingsService } = await import('../services/settingsService');
      const response = await settingsService.get('whatsapp_number');
      phoneNumber = response.data.data?.value || phoneNumber;
    } catch (error) {
      console.error('Error al cargar número de WhatsApp:', error);
    }
    const cleanPhone = phoneNumber.replace(/\D/g, '');
    const message = encodeURIComponent('¡Hola! Me gustaría obtener más información sobre FATMAC Shop');
    const whatsappUrl = `https://wa.me/${cleanPhone}?text=${message}`;
    window.open(whatsappUrl, '_blank');
  };


  return (
    <>
      <TopBar />
      <header className="bg-white shadow-kawaii sticky top-0 z-50">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between py-4">
            {/* Logo */}
            <Link to="/" className="flex items-center">
              <motion.div
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <img
                  key={logoKey}
                  src={logoUrl}
                  alt="FATMAC Shop"
                  className="h-20 w-auto object-contain"
                  onError={(e) => {
                    console.error('Header - Error al cargar logo:', logoUrl);
                    // Si falla el logo desde settings, intentar con el default
                    if (logoUrl && !logoUrl.includes('/logo-fatmac.png') && e.target.src !== '/logo-fatmac.png') {
                      e.target.src = '/logo-fatmac.png';
                    } else {
                      e.target.style.display = 'none';
                      const fallback = e.target.nextElementSibling;
                      if (fallback) {
                        fallback.classList.remove('hidden');
                      }
                    }
                  }}
                />
                <div className="hidden text-3xl font-bold bg-gradient-to-r from-pink-pastel via-purple-pastel to-yellow-pastel bg-clip-text text-transparent">
                  FATMAC Shop
                </div>
              </motion.div>
            </Link>

            {/* Navegación */}
            <nav className="hidden lg:flex items-center gap-2">
              {!menuLoading && menuItems.map((item) => (
                <Link
                  key={item.id}
                  to={item.path}
                  className={`px-4 py-2 rounded-xl font-nunito font-medium transition-all duration-300 text-sm ${
                    location.pathname === item.path || location.pathname.includes(item.slug)
                      ? 'bg-pink-pastel text-gray-800 shadow-kawaii'
                      : 'text-gray-700 hover:bg-pink-pastel hover:text-gray-800'
                  }`}
                >
                  {item.icon && <span className="mr-1">{item.icon}</span>}
                  {item.label}
                </Link>
              ))}
            </nav>

            {/* Iconos */}
            <div className="flex items-center gap-4">
              {/* Usuario */}
              {isAuthenticated ? (
                <div className="relative" ref={userMenuRef}>
                  <motion.button
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={() => setShowUserMenu(!showUserMenu)}
                    className="text-gray-700 hover:text-purple-pastel transition-colors flex items-center gap-2"
                    aria-label="Mi cuenta"
                  >
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                    <span className="hidden md:inline text-sm font-medium">{user?.name}</span>
                  </motion.button>
                  
                  {showUserMenu && (
                    <motion.div
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="absolute right-0 mt-2 w-48 kawaii-card shadow-kawaii-lg z-50"
                    >
                      <div className="py-2">
                        <div className="px-4 py-2 border-b border-gray-200">
                          <p className="text-sm font-semibold text-gray-800">{user?.name}</p>
                          <p className="text-xs text-gray-600">{user?.email}</p>
                          <span className="inline-block mt-1 px-2 py-0.5 text-xs rounded-full bg-purple-pastel text-gray-800">
                            {user?.role === 'admin' ? 'Admin' : user?.role === 'vendor' ? 'Vendedor' : 'Cliente'}
                          </span>
                        </div>
                                {(isAdmin || isVendor) && (
                                  <Link
                                    to="/dashboard"
                                    onClick={() => setShowUserMenu(false)}
                                    className="block px-4 py-2 text-sm text-gray-700 hover:bg-pink-pastel transition-colors"
                                  >
                                    📊 Dashboard
                                  </Link>
                                )}
                                {isAdmin && (
                                  <Link
                                    to="/admin/vendors"
                                    onClick={() => setShowUserMenu(false)}
                                    className="block px-4 py-2 text-sm text-gray-700 hover:bg-pink-pastel transition-colors"
                                  >
                                    👥 Gestionar Vendedores
                                  </Link>
                                )}
                                {isAuthenticated && (
                                  <Link
                                    to="/my-orders"
                                    onClick={() => setShowUserMenu(false)}
                                    className="block px-4 py-2 text-sm text-gray-700 hover:bg-pink-pastel transition-colors"
                                  >
                                    🛒 Mis Pedidos
                                  </Link>
                                )}
                                {isAuthenticated && (
                                  <Link
                                    to="/profile"
                                    onClick={() => setShowUserMenu(false)}
                                    className="block px-4 py-2 text-sm text-gray-700 hover:bg-pink-pastel transition-colors"
                                  >
                                    👤 Mi Perfil
                                  </Link>
                                )}
                                {isAuthenticated && (
                                  <Link
                                    to="/change-password"
                                    onClick={() => setShowUserMenu(false)}
                                    className="block px-4 py-2 text-sm text-gray-700 hover:bg-pink-pastel transition-colors"
                                  >
                                    🔒 Cambiar Contraseña
                                  </Link>
                                )}
                        <button
                          onClick={handleLogout}
                          className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors"
                        >
                          🚪 Cerrar Sesión
                        </button>
                      </div>
                    </motion.div>
                  )}
                </div>
              ) : (
                <Link to="/login">
                  <motion.button
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    className="text-gray-700 hover:text-purple-pastel transition-colors"
                    aria-label="Iniciar sesión"
                  >
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                  </motion.button>
                </Link>
              )}

              {/* Carrito */}
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={() => setIsCartOpen(true)}
                className="text-gray-700 hover:text-purple-pastel transition-colors relative"
                aria-label="Carrito de compras"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
                {cartCount > 0 && (
                  <span className="absolute -top-2 -right-2 bg-purple-pastel text-white text-xs rounded-full w-5 h-5 flex items-center justify-center font-bold">
                    {cartCount}
                  </span>
                )}
              </motion.button>

              {/* Botón WhatsApp Global */}
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={handleWhatsAppClick}
                className="kawaii-button bg-green-500 text-white hover:bg-green-600 flex items-center gap-2 px-4 py-2 text-sm"
                aria-label="Contactar por WhatsApp"
              >
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/>
                </svg>
                <span className="hidden xl:inline">Contactar</span>
              </motion.button>
            </div>
          </div>

          {/* Navegación móvil */}
          <nav className="lg:hidden flex items-center justify-center gap-2 py-3 border-t border-gray-200 overflow-x-auto">
            {!menuLoading && menuItems.map((item) => (
              <Link
                key={item.id}
                to={item.path}
                className={`px-3 py-1 rounded-xl text-xs font-nunito font-medium transition-all whitespace-nowrap ${
                  location.pathname === item.path || location.pathname.includes(item.slug)
                    ? 'bg-pink-pastel text-gray-800'
                    : 'text-gray-700 hover:bg-pink-pastel'
                }`}
              >
                {item.icon && <span className="mr-1">{item.icon}</span>}
                {item.label}
              </Link>
            ))}
          </nav>
        </div>
      </header>

      {/* Cart Sidebar */}
      <CartSidebar isOpen={isCartOpen} onClose={() => setIsCartOpen(false)} />
    </>
  );
};

export default Header;

