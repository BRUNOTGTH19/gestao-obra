import { useEffect, useState } from 'react'
import api from '../services/api'
import { gerarPDFGastos } from '../services/pdf'

interface Gasto {
  id: string
  categoria: string
  valor: number
  descricao: string
  dataGasto: string
}

export default function Gastos() {
  const [gastos, setGastos] = useState<Gasto[]>([])
  const [form, setForm] = useState({
    categoria: 'ALIMENTACAO',
    quantidade: '',
    valorUnitario: '',
    descricao: '',
    dataGasto: ''
  })

  // Estado dos filtros
  const [filtroDataInicio, setFiltroDataInicio] = useState('')
  const [filtroDataFim, setFiltroDataFim] = useState('')
  const [filtroCategoria, setFiltroCategoria] = useState('')

  const carregar = async () => {
    const params: any = {}
    if (filtroCategoria) params.categoria = filtroCategoria
    if (filtroDataInicio) params.dataInicio = filtroDataInicio
    if (filtroDataFim) params.dataFim = filtroDataFim

    const { data } = await api.get('/gastos', { params })
    const gastosFormatados = data.map((g: any) => ({
      ...g,
      valor: Number(g.valor)
    }))
    setGastos(gastosFormatados)
  }

  const adicionar = async (e: React.FormEvent) => {
    e.preventDefault()
    const quantidade = parseFloat(form.quantidade) || 0
    const valorUnitario = parseFloat(form.valorUnitario) || 0
    const total = quantidade * valorUnitario

    await api.post('/gastos', {
      categoria: form.categoria,
      valor: total,
      descricao: form.descricao,
      dataGasto: form.dataGasto
    })

    setForm({
      categoria: 'ALIMENTACAO',
      quantidade: '',
      valorUnitario: '',
      descricao: '',
      dataGasto: ''
    })
    carregar()
  }

  const remover = async (id: string) => {
    if (!window.confirm('Deseja realmente excluir este gasto?')) return
    await api.delete(`/gastos/${id}`)
    carregar()
  }

  const limparFiltros = () => {
    setFiltroDataInicio('')
    setFiltroDataFim('')
    setFiltroCategoria('')
  }

  useEffect(() => {
    carregar()
  }, [filtroCategoria, filtroDataInicio, filtroDataFim])

  const totalGeral = gastos.reduce((acc, g) => acc + g.valor, 0)

  return (
    <div className="min-h-screen bg-gray-900 text-white p-8">
      <h1 className="text-3xl font-bold text-amber-500 mb-8">Gastos</h1>

      {/* Filtros */}
      <div className="bg-gray-800 p-4 rounded-lg mb-6 grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
        <div>
          <label className="block text-sm text-gray-400 mb-1">Data Início</label>
          <input
            type="date"
            className="w-full p-2 rounded bg-gray-700"
            value={filtroDataInicio}
            onChange={(e) => setFiltroDataInicio(e.target.value)}
          />
        </div>
        <div>
          <label className="block text-sm text-gray-400 mb-1">Data Fim</label>
          <input
            type="date"
            className="w-full p-2 rounded bg-gray-700"
            value={filtroDataFim}
            onChange={(e) => setFiltroDataFim(e.target.value)}
          />
        </div>
        <div>
          <label className="block text-sm text-gray-400 mb-1">Categoria</label>
          <select
            className="w-full p-2 rounded bg-gray-700"
            value={filtroCategoria}
            onChange={(e) => setFiltroCategoria(e.target.value)}
          >
            <option value="">Todas</option>
            <option value="ALIMENTACAO">Alimentação</option>
            <option value="TRANSPORTE">Transporte</option>
            <option value="MATERIAL">Material</option>
          </select>
        </div>
        <button
          onClick={limparFiltros}
          className="bg-gray-600 hover:bg-gray-500 text-white font-bold py-2 px-4 rounded h-[42px]"
        >
          Limpar Filtros
        </button>
      </div>

      {/* Formulário de registro */}
      <form onSubmit={adicionar} className="bg-gray-800 p-6 rounded-lg mb-8 grid grid-cols-2 gap-4">
        <select className="p-2 rounded bg-gray-700" value={form.categoria} onChange={e => setForm({ ...form, categoria: e.target.value })}>
          <option value="ALIMENTACAO">Alimentação</option>
          <option value="TRANSPORTE">Transporte</option>
          <option value="MATERIAL">Material</option>
        </select>
        <input required type="number" min="0" step="0.01" className="p-2 rounded bg-gray-700" placeholder="Quantidade" value={form.quantidade} onChange={e => setForm({ ...form, quantidade: e.target.value })} />
        <input required type="number" min="0" step="0.01" className="p-2 rounded bg-gray-700" placeholder="Valor Unitário" value={form.valorUnitario} onChange={e => setForm({ ...form, valorUnitario: e.target.value })} />
        <input className="p-2 rounded bg-gray-700" placeholder="Descrição (opcional)" value={form.descricao} onChange={e => setForm({ ...form, descricao: e.target.value })} />
        <input required type="date" className="p-2 rounded bg-gray-700" value={form.dataGasto} onChange={e => setForm({ ...form, dataGasto: e.target.value })} />
        <button type="submit" className="col-span-2 bg-amber-500 text-black font-bold py-2 rounded">Registrar Gasto</button>
      </form>

      {/* Total geral + Exportar PDF */}
      {gastos.length > 0 && (
        <div className="flex justify-between items-center mb-4">
          <div className="text-xl font-bold text-green-400">
            Total Geral: R$ {totalGeral.toFixed(2)}
          </div>
          <button
            onClick={() => gerarPDFGastos(gastos)}
            className="bg-red-700 hover:bg-red-800 text-white font-bold py-2 px-4 rounded disabled:opacity-50"
          >
            Exportar PDF
          </button>
        </div>
      )}

      {/* Listagem */}
      <div className="grid gap-4">
        {gastos.map(g => (
          <div key={g.id} className="bg-gray-800 p-4 rounded flex justify-between items-center">
            <div>
              <span className="text-amber-500 font-bold">{g.categoria}</span>: R$ {g.valor.toFixed(2)} {g.descricao && `- ${g.descricao}`}
              <br />
              <span className="text-gray-400 text-sm">{new Date(g.dataGasto).toLocaleDateString('pt-BR')}</span>
            </div>
            <button onClick={() => remover(g.id)} className="bg-red-600 px-4 py-1 rounded hover:bg-red-700 transition">
              Remover
            </button>
          </div>
        ))}
        {gastos.length === 0 && (
          <p className="text-gray-400 text-center">Nenhum gasto encontrado com esses filtros.</p>
        )}
      </div>
    </div>
  )
}