import axios from 'axios';
import Cookies from 'js-cookie';

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL
    ? `${process.env.NEXT_PUBLIC_API_URL}/api/v1`
    : '/api',
  headers: { 'Content-Type': 'application/json' },
});

api.interceptors.request.use((config) => {
  const token = Cookies.get('token') ?? (typeof window !== 'undefined' ? localStorage.getItem('token') : null);
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

api.interceptors.response.use(
  (res) => res,
  (error) => {
    if (error.response?.status === 401) {
      Cookies.remove('token');
      if (typeof window !== 'undefined') {
        localStorage.removeItem('token');
        window.location.href = '/auth/login';
      }
    }
    return Promise.reject(error);
  },
);

// Auth
export const authApi = {
  register: (data: any) => api.post('/auth/register', data).then(r => r.data),
  login: (data: any) => api.post('/auth/login', data).then(r => r.data),
  me: () => api.get('/auth/me').then(r => r.data),
};

// Products
export const productsApi = {
  getAll: (params?: any) => api.get('/products', { params }).then(r => r.data),
  getOne: (id: string) => api.get(`/products/${id}`).then(r => r.data),
  getBySlug: (slug: string) => api.get(`/products/slug/${slug}`).then(r => r.data),
  getFeatured: (limit?: number) => api.get('/products/featured', { params: { limit } }).then(r => r.data),
  getBestSellers: (limit?: number) => api.get('/products/best-sellers', { params: { limit } }).then(r => r.data),
  create: (data: any) => api.post('/products', data).then(r => r.data),
  update: (id: string, data: any) => api.put(`/products/${id}`, data).then(r => r.data),
  delete: (id: string) => api.delete(`/products/${id}`).then(r => r.data),
  getLowStock: () => api.get('/products/low-stock').then(r => r.data),
  updateStock: (id: string, variantId: string, quantity: number) =>
    api.put(`/products/${id}/variants/${variantId}/stock`, { quantity }).then(r => r.data),
};

// Categories
export const categoriesApi = {
  getAll: () => api.get('/categories').then(r => r.data),
  create: (data: any) => api.post('/categories', data).then(r => r.data),
  update: (id: string, data: any) => api.put(`/categories/${id}`, data).then(r => r.data),
  delete: (id: string) => api.delete(`/categories/${id}`).then(r => r.data),
};

// Brands
export const brandsApi = {
  getAll: () => api.get('/brands').then(r => r.data),
  create: (data: any) => api.post('/brands', data).then(r => r.data),
  update: (id: string, data: any) => api.put(`/brands/${id}`, data).then(r => r.data),
};

// Cart
export const cartApi = {
  get: () => api.get('/cart').then(r => r.data),
  add: (productId: string, variantId: string, quantity: number) =>
    api.post('/cart/add', { productId, variantId, quantity }).then(r => r.data),
  update: (itemId: string, quantity: number) =>
    api.put(`/cart/items/${itemId}`, { quantity }).then(r => r.data),
  remove: (itemId: string) => api.delete(`/cart/items/${itemId}`).then(r => r.data),
  clear: () => api.delete('/cart').then(r => r.data),
};

// Orders
export const ordersApi = {
  create: (data: any) => api.post('/orders', data).then(r => r.data),
  myOrders: (params?: any) => api.get('/orders/my-orders', { params }).then(r => r.data),
  getOne: (id: string) => api.get(`/orders/${id}`).then(r => r.data),
  getAll: (params?: any) => api.get('/orders', { params }).then(r => r.data),
  updateStatus: (id: string, status: string, trackingCode?: string) =>
    api.put(`/orders/${id}/status`, { status, trackingCode }).then(r => r.data),
};

// Coupons
export const couponsApi = {
  validate: (code: string, subtotal: number) =>
    api.post('/coupons/validate', { code, subtotal }).then(r => r.data),
  getAll: () => api.get('/coupons').then(r => r.data),
  create: (data: any) => api.post('/coupons', data).then(r => r.data),
  delete: (id: string) => api.delete(`/coupons/${id}`).then(r => r.data),
};

// Users (admin)
export const usersApi = {
  getAll: (params?: any) => api.get('/users', { params }).then(r => r.data),
  getOne: (id: string) => api.get(`/users/${id}`).then(r => r.data),
  topCustomers: (limit?: number) =>
    api.get('/users/top-customers', { params: { limit } }).then(r => r.data),
};

// Recommendations
export const recommendationsApi = {
  getFrequentlyBoughtTogether: (productId: string) =>
    api.get(`/recommendations/frequently-bought-together/${productId}`).then(r => r.data),
  getSimilar: (productId: string) =>
    api.get(`/recommendations/similar/${productId}`).then(r => r.data),
  getPersonalized: () => api.get('/recommendations/personalized').then(r => r.data),
};

// Analytics
export const analyticsApi = {
  getDashboard: () => api.get('/analytics/dashboard').then(r => r.data),
  getTopProducts: (limit?: number) =>
    api.get('/analytics/top-products', { params: { limit } }).then(r => r.data),
  getMonthlySales: (year?: number) =>
    api.get('/analytics/monthly-sales', { params: { year } }).then(r => r.data),
  getSalesByCategory: () => api.get('/analytics/sales-by-category').then(r => r.data),
  getSalesByBrand: () => api.get('/analytics/sales-by-brand').then(r => r.data),
  getSalesBySize: () => api.get('/analytics/sales-by-size').then(r => r.data),
  getTopCustomers: (limit?: number) =>
    api.get('/analytics/top-customers', { params: { limit } }).then(r => r.data),
};

// Inventory
export const inventoryApi = {
  getAlerts: () => api.get('/inventory/alerts').then(r => r.data),
  getMovements: (params?: any) => api.get('/inventory/movements', { params }).then(r => r.data),
  registerMovement: (data: any) => api.post('/inventory/movement', data).then(r => r.data),
};

export default api;
