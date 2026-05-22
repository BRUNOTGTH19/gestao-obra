import { useState, useEffect } from 'react'
import api from '../services/api'

interface User {
  id: string
  email: string
}

export function useAuth() {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const token = localStorage.getItem('token')
    if (token) {
      try {
        const payload = JSON.parse(atob(token.split('.')[1]))
        setUser({ id: payload.id, email: payload.email })
      } catch {
        localStorage.removeItem('token')
      }
    }
    setLoading(false)
  }, [])

  const login = async (email: string, senha: string) => {
    const { data } = await api.post('/auth/login', { email, senha })
    localStorage.setItem('token', data.token)
    const payload = JSON.parse(atob(data.token.split('.')[1]))
    setUser({ id: payload.id, email: payload.email })
    return data
  }

  const logout = () => {
    localStorage.removeItem('token')
    setUser(null)
    window.location.href = '/login'
  }

  return { user, loading, login, logout }
}