import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { CartProvider } from './context/CartContext';
import Layout from './components/Layout';
import Home from './pages/Home';
import Tienda from './pages/Tienda';
import RedirectToTienda from './components/RedirectToTienda';
import Contacto from './pages/Contacto';
import ProductDetail from './pages/ProductDetail';
import Cart from './pages/Cart';
import Checkout from './pages/Checkout';
import CheckoutSuccess from './pages/CheckoutSuccess';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import ManageProducts from './pages/ManageProducts';
import Orders from './pages/Orders';
import MyOrders from './pages/MyOrders';
import AdminVendors from './pages/AdminVendors';
import HomeCms from './pages/HomeCms';
import Profile from './pages/Profile';
import ChangePassword from './pages/ChangePassword';
import PrivateRoute from './components/PrivateRoute';
import './App.css';

function App() {
  return (
    <CartProvider>
      <Router>
        <Routes>
          {/* Rutas públicas sin Layout */}
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          
                    {/* Rutas con Layout */}
                    <Route path="/" element={<Layout />}>
                      <Route index element={<Home />} />
                      <Route path="/tienda" element={<Tienda />} />
                      <Route path="/ninos" element={<RedirectToTienda filters={{ category_id: [] }} />} />
                      <Route path="/ninas" element={<RedirectToTienda filters={{ category_id: [] }} />} />
                      <Route path="/novedades" element={<RedirectToTienda filters={{ is_new: true }} />} />
                      <Route path="/ofertas" element={<RedirectToTienda filters={{ has_discount: true }} />} />
                      <Route path="/categoria/:slug" element={<RedirectToTienda />} />
            <Route path="/contacto" element={<Contacto />} />
            <Route path="/products/:id" element={<ProductDetail />} />
            <Route path="/cart" element={<Cart />} />
            
            {/* Rutas de checkout (públicas) */}
            <Route path="/checkout" element={<Checkout />} />
            <Route path="/checkout/success" element={<CheckoutSuccess />} />
            
            {/* Rutas del panel de administración (solo vendor/admin) */}
            <Route 
              path="/dashboard" 
              element={
                <PrivateRoute>
                  <Dashboard />
                </PrivateRoute>
              } 
            />
            <Route 
              path="/dashboard/products" 
              element={
                <PrivateRoute>
                  <ManageProducts />
                </PrivateRoute>
              } 
            />
            <Route 
              path="/dashboard/orders" 
              element={
                <PrivateRoute>
                  <Orders />
                </PrivateRoute>
              } 
            />
            <Route 
              path="/my-orders" 
              element={
                <PrivateRoute>
                  <MyOrders />
                </PrivateRoute>
              } 
            />
            <Route 
              path="/profile" 
              element={
                <PrivateRoute>
                  <Profile />
                </PrivateRoute>
              } 
            />
            <Route 
              path="/change-password" 
              element={
                <PrivateRoute>
                  <ChangePassword />
                </PrivateRoute>
              } 
            />
            
            {/* Rutas de administración (solo admin) */}
            <Route 
              path="/admin/vendors" 
              element={
                <PrivateRoute requiredRole="admin">
                  <AdminVendors />
                </PrivateRoute>
              } 
            />
            <Route 
              path="/admin/home-cms" 
              element={
                <PrivateRoute requiredRole="admin">
                  <HomeCms />
                </PrivateRoute>
              } 
            />
          </Route>
        </Routes>
      </Router>
    </CartProvider>
  );
}

export default App;
