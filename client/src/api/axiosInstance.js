// Shared Axios instance for the app
// - Base URL is configurable via VITE_API_BASE_URL env variable
// - Automatically attaches JWT from localStorage (assumes key 'auth_token')
// - Emits a window 'unauthorized' event on 401 so the app can handle logout

import axios from 'axios';

// Make base URL easy to change (use .env: VITE_API_BASE_URL)
// Default to '/api' to use Vite's proxy in development
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '/api';

const axiosInstance = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor: attach Authorization header when token exists
axiosInstance.interceptors.request.use(
  (config) => {
    // NOTE: this reads the same storage key used by AuthContext ('auth_token')
    const token = localStorage.getItem('auth_token');
    if (token) {
      config.headers = config.headers || {};
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor: handle 401s centrally, let other errors bubble up
axiosInstance.interceptors.response.use(
  (response) => response,
  (error) => {
    // Log all errors with comprehensive details for debugging
    // Only log sensitive data in development
    // eslint-disable-next-line no-console
    console.error('[api] Request error:', {
      message: error.message,
      code: error.code,
      status: error.response?.status,
      statusText: error.response?.statusText,
      url: error.config?.url,
      method: error.config?.method?.toUpperCase(),
      data: import.meta.env.DEV ? error.response?.data : '[redacted in production]'
    });

    if (error && error.response) {
      if (error.response.status === 401) {
        // Useful hook: app can listen for this event and run logout flow
        try {
          // eslint-disable-next-line no-console
          console.warn('[api] 401 Unauthorized - dispatching `unauthorized` event');
          const evt = new CustomEvent('unauthorized', { detail: { message: 'Unauthorized' } });
          window.dispatchEvent(evt);
        } catch (e) {
          // ignore event dispatch failures
        }
      }
    }

    // Reject so that calling code can decide how to handle errors
    return Promise.reject(error);
  }
);

export default axiosInstance;
// (The rest of this file is intentionally consolidated above.)
