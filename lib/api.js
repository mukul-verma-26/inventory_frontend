import axios from 'axios';

const API_URL = 'https://inventory-backend-k3qq.onrender.com/api';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Products API
export const getProducts = () => api.get('/products');
export const getProduct = (id) => api.get(`/products/${id}`);
export const createProduct = (data) => api.post('/products', data);
export const updateProduct = (id, data) => api.put(`/products/${id}`, data);
export const deleteProduct = (id) => api.delete(`/products/${id}`);

// Transactions API
export const getTransactions = () => api.get('/transactions');
export const createTransaction = (data) => api.post('/transactions', data);

// Analytics API
export const getAnalytics = () => api.get('/analytics');

// Seed data
export const seedData = () => api.post('/seed');

// Health check
export const healthCheck = () => api.get('/health');

export default api;
