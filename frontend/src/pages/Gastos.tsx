import { useEffect, useState } from 'react'
import api from '../services/api'
import { gerarPDFGastos } from '../services/pdf'
import { formatDate, getTodayLocal } from '../utils/date'
import { Pencil, Trash2, Plus, FileText, X } from 'lucide-react'

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
    dataGasto: getTodayLocal()
  })

  // Filtros
  const [filtroDataInicio, setFiltroDataInicio] = useState('')
  const [filtroDataFim, setFiltroDataFim] = useState('')
  const [filtroCategoria, setFiltroCategoria] = useState('')

  // Modal de edição
  const [editando, setEditando] = useState<Gasto | null>(null)
  const [editForm, setEditForm] = useState({
    categoria: 'ALIMENTACAO',
    valor: '',
    descricao: '',
    dataGasto: ''
  })

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
      dataGasto: getTodayLocal()
    })
    carregar()
  }

  const remover = async (id: string) => {
    if (!window.confirm('Deseja realmente excluir este gasto?')) return
    await api.delete(`/gastos/${id}`)
    carregar()
  }

  const iniciarEdicao = (gasto: Gasto) => {
    setEditando(gasto)
    setEditForm({
      categoria: gasto.categoria,
      valor: gasto.valor.toString(),
      descricao: gasto.descricao || '',
      dataGasto: gasto.dataGasto
    })
  }

  const salvarEdicao = async () => {
    if (!editando) return
    await api.put(`/gastos/${editando.id}`, {
      categoria: editForm.categoria,
      valor: parseFloat(editForm.valor),
      descricao: editForm.descricao,
      dataGasto: editForm.dataGasto
    })
    setEditando(null)
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

  // Classes base para os inputs
  const inputClass = "w-full px-3 py-2 rounded-lg bg-gray-900/50 border border-gray-700 text-white placeholder-gray-400 focus:border-amber-500 focus:ring-1 focus:ring-amber-500 transition"
  const selectClass = "w-full px-3 py-2 rounded-lg bg-gray-900/50 border border-gray-700 text-white focus:border-amber-500 focus:ring-1 focus:ring-amber-500 transition"
  const btnPrimary = "bg-amber-500 hover:bg-amber-600 text-black font-semibold py-2 px-4 rounded-lg transition-all flex items-center gap-2"
  const btnSecondary = "bg-gray-700 hover:bg-gray-600 text-white font-medium py-2 px-4 rounded-lg transition-all flex items-center gap-2"

  return (
    <div className="min-h-screen bg-gray-950 text-white p-4 md:p-8">
      {/* Cabeçalho */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <h1 className="text-3xl font-bold text-amber-500 flex items-center gap-3">
          <FileText className="w-8 h-8" />
          Gastos
        </h1>
        {/* Botão Exportar PDF */}
        <button
          onClick={() => gerarPDFGastos(gastos)}
          disabled={gastos.length === 0}
          className="bg-red-700 hover:bg-red-800 text-white font-bold py-2 px-4 rounded-lg disabled:opacity-50 transition-all"
        >
          Exportar PDF
        </button>
      </div>

      {/* Filtros */}
      <div className="bg-gray-900/60 backdrop-blur-sm p-4 rounded-xl mb-8 border border-gray-800/50">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <label className="block text-sm text-gray-400 mb-1">Data Início</label>
            <input type="date" className={inputClass} value={filtroDataInicio} onChange={e => setFiltroDataInicio(e.target.value)} />
          </div>
          <div>
            <label className="block text-sm text-gray-400 mb-1">Data Fim</label>
            <input type="date" className={inputClass} value={filtroDataFim} onChange={e => setFiltroDataFim(e.target.value)} />
          </div>
          <div>
            <label className="block text-sm text-gray-400 mb-1">Categoria</label>
            <select className={selectClass} value={filtroCategoria} onChange={e => setFiltroCategoria(e.target.value)}>
              <option value="">Todas</option>
              <option value="ALIMENTACAO">Alimentação</option>
              <option value="TRANSPORTE">Transporte</option>
              <option value="MATERIAL">Material</option>
            </select>
          </div>
          <div className="flex items-end">
            <button onClick={limparFiltros} className={btnSecondary}>
              <X className="w-4 h-4" /> Limpar
            </button>
          </div>
        </div>
      </div>

      {/* Formulário de registro */}
      <form onSubmit={adicionar} className="bg-gray-900/60 backdrop-blur-sm p-6 rounded-xl mb-8 border border-gray-800/50">
        <h2 className="text-xl font-semibold text-amber-500 mb-4">Novo Gasto</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <select className={selectClass} value={form.categoria} onChange={e => setForm({ ...form, categoria: e.target.value })}>
            <option value="ALIMENTACAO">Alimentação</option>
            <option value="TRANSPORTE">Transporte</option>
            <option value="MATERIAL">Material</option>
          </select>
          <input required type="number" min="0" step="0.01" className={inputClass} placeholder="Quantidade" value={form.quantidade} onChange={e => setForm({ ...form, quantidade: e.target.value })} />
          <input required type="number" min="0" step="0.01" className={inputClass} placeholder="Valor Unitário" value={form.valorUnitario} onChange={e => setForm({ ...form, valorUnitario: e.target.value })} />
          <input className={inputClass} placeholder="Descrição (opcional)" value={form.descricao} onChange={e => setForm({ ...form, descricao: e.target.value })} />
          <input required type="date" className={inputClass} value={form.dataGasto} onChange={e => setForm({ ...form, dataGasto: e.target.value })} />
          <button type="submit" className={btnPrimary}>
            <Plus className="w-4 h-4" /> Registrar
          </button>
        </div>
      </form>

      {/* Total geral */}
      {gastos.length > 0 && (
        <div className="flex justify-between items-center mb-6 bg-gray-900/60 backdrop-blur-sm p-4 rounded-xl border border-gray-800/50">
          <span className="text-lg font-medium">Total Geral:</span>
          <span className="text-2xl font-bold text-green-400">R$ {totalGeral.toFixed(2)}</span>
        </div>
      )}

      {/* Listagem */}
      <div className="space-y-4">
        {gastos.map(g => (
          <div key={g.id} className="bg-gray-900/60 backdrop-blur-sm p-4 rounded-xl border border-gray-800/50 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 hover:border-amber-500/30 transition-all">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <span className="text-amber-500 font-bold text-lg">{g.categoria}</span>
                <span className="text-gray-400 text-sm">- {formatDate(g.dataGasto)}</span>
              </div>
              <p className="text-xl font-semibold">R$ {g.valor.toFixed(2)}</p>
              {g.descricao && <p className="text-gray-400 text-sm mt-1">{g.descricao}</p>}
            </div>
            <div className="flex gap-2">
              <button onClick={() => iniciarEdicao(g)} className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded-lg flex items-center gap-1 transition">
                <Pencil className="w-4 h-4" /> Editar
              </button>
              <button onClick={() => remover(g.id)} className="bg-red-600 hover:bg-red-700 text-white px-3 py-1 rounded-lg flex items-center gap-1 transition">
                <Trash2 className="w-4 h-4" /> Remover
              </button>
            </div>
          </div>
        ))}
        {gastos.length === 0 && (
          <p className="text-gray-400 text-center py-8">Nenhum gasto encontrado com esses filtros.</p>
        )}
      </div>

      {/* Modal de edição */}
      {editando && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-gray-900 border border-gray-800 p-6 rounded-xl w-full max-w-md">
            <h2 className="text-2xl font-bold text-amber-500 mb-6">Editar Gasto</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm text-gray-400 mb-1">Categoria</label>
                <select className={selectClass} value={editForm.categoria} onChange={e => setEditForm({...editForm, categoria: e.target.value})}>
                  <option value="ALIMENTACAO">Alimentação</option>
                  <option value="TRANSPORTE">Transporte</option>
                  <option value="MATERIAL">Material</option>
                </select>
              </div>
              <div>
                <label className="block text-sm text-gray-400 mb-1">Valor (R$)</label>
                <input type="number" min="0" step="0.01" className={inputClass} value={editForm.valor} onChange={e => setEditForm({...editForm, valor: e.target.value})} />
              </div>
              <div>
                <label className="block text-sm text-gray-400 mb-1">Descrição</label>
                <input className={inputClass} value={editForm.descricao} onChange={e => setEditForm({...editForm, descricao: e.target.value})} />
              </div>
              <div>
                <label className="block text-sm text-gray-400 mb-1">Data</label>
                <input type="date" className={inputClass} value={editForm.dataGasto} onChange={e => setEditForm({...editForm, dataGasto: e.target.value})} />
              </div>
            </div>
            <div className="flex justify-end gap-4 mt-6">
              <button onClick={() => setEditando(null)} className={btnSecondary}>
                <X className="w-4 h-4" /> Cancelar
              </button>
              <button onClick={salvarEdicao} className={btnPrimary}>
                <Pencil className="w-4 h-4" /> Salvar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}