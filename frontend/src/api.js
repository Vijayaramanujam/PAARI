import axios from 'axios';

const api = axios.create({
  baseURL: '', // Empty because Vite proxy handles routing '/api' to 'http://localhost:8080'
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request Interceptor: Attach bearer token if authenticated
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response Interceptor: Handle globally common REST status codes
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      // Auto logout on unauthorized response token expiry
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.dispatchEvent(new Event('auth-expired'));
    }
    return Promise.reject(error);
  }
);

export default api;
