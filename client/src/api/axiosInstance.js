import axios from 'axios'

const axiosInstance = axios.create({
  // keep baseURL empty so the dev server proxy (if configured) handles /api
  baseURL: '',
  headers: {
    'Content-Type': 'application/json',
  },
})

// Attach token from localStorage to each request if present
axiosInstance.interceptors.request.use((config) => {
  try {
    const token = localStorage.getItem('auth_token')
    if (token) {
      config.headers = config.headers || {}
      config.headers.Authorization = `Bearer ${token}`
    }
  } catch (e) {
    // ignore
  }
  return config
})

export default axiosInstance
