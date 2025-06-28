import axios from 'axios';

const API_URL = 'http://localhost:5000/api';

// Create axios instance with default config
const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true
});

// Add token to requests if it exists
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Add response interceptor to handle errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Handle unauthorized access
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Auth services
export const authService = {
  register: (userData) => api.post('/auth/register', userData),
  login: (credentials) => api.post('/auth/login', credentials),
  getCurrentUser: () => api.get('/auth/me'),
};

// Product services
export const productService = {
  getAll: (params) => api.get('/products', { params }),
  getBySlug: (slug) => api.get(`/products/${slug}`),
  create: (productData) => api.post('/products', productData),
  update: (id, productData) => api.put(`/products/${id}`, productData),
  delete: (id) => api.delete(`/products/${id}`),
  addRating: (id, ratingData) => api.post(`/products/${id}/ratings`, ratingData),
};

// Cart services
export const cartService = {
  getCart: () => api.get('/cart'),
  addToCart: (productId, quantity) => api.post('/cart/add', { productId, quantity }),
  updateQuantity: (productId, quantity) => api.put(`/cart/update/${productId}`, { quantity }),
  removeFromCart: (productId) => api.delete(`/cart/remove/${productId}`),
  clearCart: () => api.delete('/cart/clear'),
};

// Wishlist services
export const wishlistService = {
  getWishlist: () => api.get('/wishlist'),
  addToWishlist: (productId) => api.post(`/wishlist/add/${productId}`),
  removeFromWishlist: (productId) => api.delete(`/wishlist/remove/${productId}`),
  clearWishlist: () => api.delete('/wishlist/clear'),
};

// Customisation services
export const customisationService = {
  getOptions: (productId) => api.get(`/customisation/${productId}`),
  updateOptions: (productId, options) => api.put(`/customisation/${productId}`, options),
  validateOptions: (productId, options) => api.post(`/customisation/validate/${productId}`, { options }),
  submitRequest: (formData) => {
    const config = {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    };
    return api.post('/customisation/submit', formData, config);
  },
  getRequests: () => api.get('/customisation/requests'),
  updateRequestStatus: (id, status) => api.put(`/customisation/requests/${id}`, { status })
};

export default api; 