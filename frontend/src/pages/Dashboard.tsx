import { useAuth } from '../hooks/useAuth'
import { Link } from 'react-router-dom'

export default function Dashboard() {
  const { user, logout } = useAuth()

  return (
    <div className="min-h-screen bg-gray-900 text-white p-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-amber-500">Painel Principal</h1>
        <div>
          <span className="mr-4">{user?.email}</span>
          <button onClick={logout} className="bg-red-600 px-4 py-2 rounded">Sair</button>
        </div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
         <Link to="/orcamento-manual" className="bg-gray-800 p-6 rounded-lg hover:bg-gray-700 transition">
  <h2 className="text-xl font-bold text-amber-500">Orçamento Manual</h2>
  <p className="text-gray-400 mt-2">Cadastrar materiais e calcular total</p>
</Link>
        <Link to="/funcionarios" className="bg-gray-800 p-6 rounded-lg hover:bg-gray-700 transition">
          <h2 className="text-xl font-bold text-amber-500">Funcionários</h2>
          <p className="text-gray-400 mt-2">Gerenciar equipe e contratos</p>
        </Link>
        <Link to="/gastos" className="bg-gray-800 p-6 rounded-lg hover:bg-gray-700 transition">
          <h2 className="text-xl font-bold text-amber-500">Gastos</h2>
          <p className="text-gray-400 mt-2">Controle de despesas da obra</p>
        </Link>
        <Link to="/orcamentos" className="bg-gray-800 p-6 rounded-lg hover:bg-gray-700 transition">
          <h2 className="text-xl font-bold text-amber-500">Orçamentos IA</h2>
          <p className="text-gray-400 mt-2">Gerar orçamentos inteligentes</p>
        </Link>
      </div>
    </div>
  )
}