import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'
import { LogIn } from 'lucide-react'

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
    <div className="min-h-screen flex items-center justify-center bg-gray-950 p-4">
      <div className="bg-gray-900/60 backdrop-blur-sm border border-gray-800/50 p-6 md:p-8 rounded-2xl w-full max-w-sm">
        <div className="flex items-center gap-2 md:gap-3 mb-4 md:mb-6">
          <div className="bg-amber-500/20 p-2 rounded-lg">
            <LogIn className="w-5 h-5 md:w-6 md:h-6 text-amber-500" />
          </div>
          <h1 className="text-lg md:text-2xl font-bold text-amber-500">Gestão Obra</h1>
        </div>
        <form onSubmit={handleSubmit} className="space-y-3 md:space-y-4">
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full px-3 py-2 md:px-4 md:py-3 rounded-lg bg-gray-900/50 border border-gray-700 text-white placeholder-gray-400 focus:border-amber-500 focus:ring-1 focus:ring-amber-500 transition text-sm md:text-base"
            required
          />
          <input
            type="password"
            placeholder="Senha"
            value={senha}
            onChange={(e) => setSenha(e.target.value)}
            className="w-full px-3 py-2 md:px-4 md:py-3 rounded-lg bg-gray-900/50 border border-gray-700 text-white placeholder-gray-400 focus:border-amber-500 focus:ring-1 focus:ring-amber-500 transition text-sm md:text-base"
            required
          />
          <button
            type="submit"
            className="w-full bg-amber-500 hover:bg-amber-600 text-black font-semibold py-2 md:py-3 rounded-lg transition-all flex items-center justify-center gap-2 text-sm md:text-base"
          >
            <LogIn className="w-4 h-4" /> Entrar
          </button>
        </form>
      </div>
    </div>
  )
}