import api from './api';

export const orderService = {
  // Crear un nuevo pedido
  create: (formData) => {
    return api.post('/orders', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
  },

  // Obtener pedidos del vendor (requiere autenticación)
  getVendorOrders: (params = {}) => {
    return api.get('/orders/vendor', { params });
  },

  // Obtener pedidos del cliente (requiere autenticación)
  getCustomerOrders: (params = {}) => {
    return api.get('/orders/customer', { params });
  },

  // Obtener última dirección del cliente (requiere autenticación)
  getLastAddress: () => {
    return api.get('/orders/last-address');
  },

  // Actualizar estado del pedido (requiere autenticación)
  updateStatus: (orderId, status) => {
    return api.patch(`/orders/${orderId}/status`, { status });
  },

  // Obtener QR del vendedor (público)
  getVendorQr: (vendorId, paymentMethod) => {
    return api.get('/orders/vendor-qr', {
      params: { vendor_id: vendorId, payment_method: paymentMethod },
    });
  },
};

