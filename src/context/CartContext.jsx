import { createContext, useContext, useState, useEffect } from 'react';
import Swal from 'sweetalert2';

const CartContext = createContext();

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};

export const CartProvider = ({ children }) => {
  const [cart, setCart] = useState([]);
  const [isCartOpen, setIsCartOpen] = useState(false);

  // Cargar carrito del localStorage al iniciar
  useEffect(() => {
    const savedCart = localStorage.getItem('fatmac_cart');
    if (savedCart) {
      try {
        setCart(JSON.parse(savedCart));
      } catch (e) {
        console.error('Error loading cart from localStorage:', e);
      }
    }
  }, []);

  // Guardar carrito en localStorage cuando cambie
  useEffect(() => {
    localStorage.setItem('fatmac_cart', JSON.stringify(cart));
  }, [cart]);

  const addToCart = async (product) => {
    // Validar que el producto tenga stock
    if (product.stock !== null && product.stock <= 0) {
      await Swal.fire({
        icon: 'warning',
        title: 'Sin stock',
        text: 'Este producto no tiene stock disponible',
        confirmButtonText: 'Entendido',
        confirmButtonColor: '#a855f7',
        customClass: {
          popup: 'kawaii-card',
          confirmButton: 'kawaii-button bg-purple-pastel text-white hover:bg-purple-600',
        },
      });
      return;
    }

    // Validar que todos los productos sean del mismo vendedor
    const prevCart = [...cart];
    if (prevCart.length > 0) {
      const firstProductVendorId = prevCart[0]?.vendor?.id;
      const newProductVendorId = product?.vendor?.id;

      if (firstProductVendorId && newProductVendorId && firstProductVendorId !== newProductVendorId) {
        await Swal.fire({
          icon: 'warning',
          title: 'Productos de diferentes vendedores',
          html: `Tu carrito ya contiene productos del vendedor <strong>${prevCart[0]?.vendor?.name || 'otro vendedor'}</strong>. No puedes añadir productos de <strong>${product?.vendor?.name || 'otro vendedor'}</strong> en la misma compra.<br><br>Finaliza tu compra actual o vacía el carrito para agregar productos de otro vendedor.`,
          showCancelButton: true,
          confirmButtonText: 'Vaciar carrito y añadir',
          cancelButtonText: 'Mantener carrito actual',
          confirmButtonColor: '#a855f7',
          cancelButtonColor: '#4b5563',
          customClass: {
            popup: 'kawaii-card',
            confirmButton: 'kawaii-button bg-purple-pastel text-white hover:bg-purple-600 font-semibold px-6 py-3 rounded-xl shadow-md',
            cancelButton: 'kawaii-button bg-white text-gray-800 hover:bg-gray-50 font-semibold px-6 py-3 rounded-xl border-2 border-gray-400 shadow-md hover:border-gray-500',
          },
          buttonsStyling: true,
        }).then((result) => {
          if (result.isConfirmed) {
            clearCart();
            setCart([{ ...product, quantity: 1 }]);
            setIsCartOpen(true);
          }
        });
        return;
      }
    }

    const existingItem = prevCart.find((item) => item.id === product.id);
    
    // Validar stock disponible
    if (existingItem) {
      const newQuantity = existingItem.quantity + 1;
      if (product.stock !== null && newQuantity > product.stock) {
        await Swal.fire({
          icon: 'warning',
          title: 'Stock insuficiente',
          text: `No hay suficiente stock. Stock disponible: ${product.stock}`,
          confirmButtonText: 'Entendido',
          confirmButtonColor: '#a855f7',
          customClass: {
            popup: 'kawaii-card',
            confirmButton: 'kawaii-button bg-purple-pastel text-white hover:bg-purple-600',
          },
        });
        return;
      }
      setCart(prevCart.map((item) =>
        item.id === product.id
          ? { ...item, quantity: newQuantity }
          : item
      ));
    } else {
      setCart([...prevCart, { ...product, quantity: 1 }]);
    }
    
    // Abrir el panel del carrito después de agregar
    setIsCartOpen(true);
  };

  const removeFromCart = (productId) => {
    setCart((prevCart) => prevCart.filter((item) => item.id !== productId));
  };

  const updateQuantity = async (productId, quantity) => {
    if (quantity <= 0) {
      removeFromCart(productId);
      return;
    }
    
    setCart((prevCart) => {
      const item = prevCart.find((item) => item.id === productId);
      if (item && item.stock !== null && quantity > item.stock) {
        Swal.fire({
          icon: 'warning',
          title: 'Stock insuficiente',
          text: `No hay suficiente stock. Stock disponible: ${item.stock}`,
          confirmButtonText: 'Entendido',
          confirmButtonColor: '#a855f7',
          customClass: {
            popup: 'kawaii-card',
            confirmButton: 'kawaii-button bg-purple-pastel text-white hover:bg-purple-600',
          },
        });
        return prevCart; // No cambiar la cantidad
      }
      
      return prevCart.map((item) =>
        item.id === productId ? { ...item, quantity } : item
      );
    });
  };

  const getVendorId = () => {
    if (cart.length === 0) return null;
    return cart[0]?.vendor?.id;
  };

  const clearCart = () => {
    setCart([]);
  };

  const getCartTotal = () => {
    return cart.reduce((total, item) => {
      const price = item.discounted_price || item.price;
      return total + price * item.quantity;
    }, 0);
  };

  const getCartCount = () => {
    return cart.reduce((total, item) => total + item.quantity, 0);
  };

  const value = {
    cart,
    addToCart,
    removeFromCart,
    updateQuantity,
    clearCart,
    getCartTotal,
    getCartCount,
    getVendorId,
    isCartOpen,
    setIsCartOpen,
  };

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
};

