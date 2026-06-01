import axios from 'axios'

// ✅ FIX: URL via variável de ambiente — não mais hardcoded no código
// Em desenvolvimento: VITE_API_URL=http://localhost:3001/api/v1
// Em produção (Render): VITE_API_URL=https://gestao-obra-api.onrender.com/api/v1
const baseURL = import.meta.env.VITE_API_URL ?? 'http://localhost:3001/api/v1'

const api = axios.create({ baseURL })

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token')
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})

api.interceptors.response.use(
  (res) => res,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token')
      window.location.href = '/login'
    }
    return Promise.reject(error)
  }
)

export default api