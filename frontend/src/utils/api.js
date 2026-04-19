import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_URL,
  headers: { 'Content-Type': 'application/json' },
  timeout: 15000,
});

api.interceptors.request.use(config => {
  const token = localStorage.getItem('medirush_token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
}, err => Promise.reject(err));

api.interceptors.response.use(
  res => res,
  err => {
    if (err.response?.status === 401) {
      const onAuthPage = ['/login', '/register'].some(p => window.location.pathname.includes(p));
      if (!onAuthPage) {
        localStorage.removeItem('medirush_token');
        window.location.href = '/login';
      }
    }
    return Promise.reject(err);
  }
);

export default api;
