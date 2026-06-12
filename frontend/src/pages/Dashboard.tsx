import { useAuth } from '../hooks/useAuth'
import { Link } from 'react-router-dom'
import { Users, ShoppingCart, FileText, Calculator } from 'lucide-react'

export default function Dashboard() {
  const { user, logout } = useAuth()

  return (
    <div className="min-h-screen bg-gray-950 text-white p-4 md:p-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <h1 className="text-2xl md:text-3xl font-bold text-amber-500">Painel Principal</h1>
        <div className="flex items-center gap-4">
          <span className="text-gray-400 text-sm md:text-base">{user?.email}</span>
          <button onClick={logout} className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg text-sm transition">
            Sair
          </button>
        </div>
      </div>

      {/* 2 colunas no mobile, 4 no desktop */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-6">
        <Link to="/funcionarios" className="bg-gray-900/60 backdrop-blur-sm border border-gray-800/50 p-4 md:p-6 rounded-xl hover:border-amber-500/50 transition-all hover:scale-105 flex flex-col items-center text-center">
          <Users className="w-8 h-8 md:w-10 md:h-10 text-amber-500 mb-2 md:mb-4" />
          <h2 className="text-sm md:text-xl font-bold text-amber-500">Funcionários</h2>
          <p className="text-gray-400 text-xs md:text-sm mt-1 md:mt-2">Gerenciar equipe e contratos</p>
        </Link>
        <Link to="/gastos" className="bg-gray-900/60 backdrop-blur-sm border border-gray-800/50 p-4 md:p-6 rounded-xl hover:border-amber-500/50 transition-all hover:scale-105 flex flex-col items-center text-center">
          <ShoppingCart className="w-8 h-8 md:w-10 md:h-10 text-amber-500 mb-2 md:mb-4" />
          <h2 className="text-sm md:text-xl font-bold text-amber-500">Gastos</h2>
          <p className="text-gray-400 text-xs md:text-sm mt-1 md:mt-2">Controle de despesas da obra</p>
        </Link>
        <Link to="/orcamento-manual" className="bg-gray-900/60 backdrop-blur-sm border border-gray-800/50 p-4 md:p-6 rounded-xl hover:border-amber-500/50 transition-all hover:scale-105 flex flex-col items-center text-center">
          <FileText className="w-8 h-8 md:w-10 md:h-10 text-amber-500 mb-2 md:mb-4" />
          <h2 className="text-sm md:text-xl font-bold text-amber-500">Orçamento Manual</h2>
          <p className="text-gray-400 text-xs md:text-sm mt-1 md:mt-2">Cadastrar materiais e calcular total</p>
        </Link>
        <Link to="/orcamentos" className="bg-gray-900/60 backdrop-blur-sm border border-gray-800/50 p-4 md:p-6 rounded-xl hover:border-amber-500/50 transition-all hover:scale-105 flex flex-col items-center text-center">
          <Calculator className="w-8 h-8 md:w-10 md:h-10 text-amber-500 mb-2 md:mb-4" />
          <h2 className="text-sm md:text-xl font-bold text-amber-500">Orçamentos IA</h2>
          <p className="text-gray-400 text-xs md:text-sm mt-1 md:mt-2">Gerar orçamentos inteligentes</p>
        </Link>
      </div>
    </div>
  )
}