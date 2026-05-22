import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'

export default function Login() {
  const [email, setEmail] = useState('')
  const [senha, setSenha] = useState('')
  const { login } = useAuth()
  const navigate = useNavigate()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      await login(email, senha)
      navigate('/dashboard')
    } catch (error) {
      alert('Credenciais inválidas')
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-900">
      <form onSubmit={handleSubmit} className="bg-gray-800 p-8 rounded-lg w-96">
        <h1 className="text-2xl font-bold text-amber-500 mb-6">Gestão Obra</h1>
        <input
          type="email" placeholder="Email" value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full p-2 mb-4 rounded bg-gray-700 text-white"
          required
        />
        <input
          type="password" placeholder="Senha" value={senha}
          onChange={(e) => setSenha(e.target.value)}
          className="w-full p-2 mb-6 rounded bg-gray-700 text-white"
          required
        />
        <button type="submit" className="w-full bg-amber-500 text-black font-bold py-2 rounded">
          Entrar
        </button>
      </form>
    </div>
  )
}