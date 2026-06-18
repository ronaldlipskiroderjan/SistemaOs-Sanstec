import axios from 'axios'

export const axiosClient = axios.create({
  headers: { 'Content-Type': 'application/json' },
})

axiosClient.interceptors.request.use(config => {
  const token = localStorage.getItem('token')
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})

axiosClient.interceptors.response.use(
  res => res,
  err => {
    const isAuthEndpoint = err.config?.url?.includes('/api/auth')
    if (err.response?.status === 401 && !isAuthEndpoint) {
      localStorage.removeItem('token')
      window.location.href = '/login'
    }
    return Promise.reject(err)
  }
)
