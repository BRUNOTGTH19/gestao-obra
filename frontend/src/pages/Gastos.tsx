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

  const [filtroDataInicio, setFiltroDataInicio] = useState('')
  const [filtroDataFim, setFiltroDataFim] = useState('')
  const [filtroCategoria, setFiltroCategoria] = useState('')

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

  const inputClass = "w-full px-2 py-1.5 md:px-3 md:py-2 rounded-lg bg-gray-900/50 border border-gray-700 text-white placeholder-gray-400 focus:border-amber-500 focus:ring-1 focus:ring-amber-500 transition text-sm md:text-base"
  const selectClass = "w-full px-2 py-1.5 md:px-3 md:py-2 rounded-lg bg-gray-900/50 border border-gray-700 text-white focus:border-amber-500 focus:ring-1 focus:ring-amber-500 transition text-sm md:text-base"
  const btnPrimary = "bg-amber-500 hover:bg-amber-600 text-black font-semibold py-1.5 px-3 md:py-2 md:px-4 rounded-lg transition-all flex items-center gap-1 md:gap-2 text-xs md:text-sm"
  const btnSecondary = "bg-gray-700 hover:bg-gray-600 text-white font-medium py-1.5 px-3 md:py-2 md:px-4 rounded-lg transition-all flex items-center gap-1 md:gap-2 text-xs md:text-sm"

  return (
    <div className="min-h-screen bg-gray-950 text-white p-3 md:p-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-4 md:mb-8 gap-3">
        <h1 className="text-xl md:text-3xl font-bold text-amber-500 flex items-center gap-2 md:gap-3">
          <FileText className="w-6 h-6 md:w-8 md:h-8" />
          Gastos
        </h1>
        <button
          onClick={() => gerarPDFGastos(gastos)}
          disabled={gastos.length === 0}
          className="bg-red-700 hover:bg-red-800 text-white font-bold py-1.5 px-3 md:py-2 md:px-4 rounded-lg disabled:opacity-50 transition-all text-xs md:text-sm"
        >
          Exportar PDF
        </button>
      </div>

      <div className="bg-gray-900/60 backdrop-blur-sm p-3 md:p-4 rounded-xl mb-4 md:mb-8 border border-gray-800/50">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2 md:gap-4">
          <div>
            <label className="block text-xs md:text-sm text-gray-400 mb-1">Início</label>
            <input type="date" className={inputClass} value={filtroDataInicio} onChange={e => setFiltroDataInicio(e.target.value)} />
          </div>
          <div>
            <label className="block text-xs md:text-sm text-gray-400 mb-1">Fim</label>
            <input type="date" className={inputClass} value={filtroDataFim} onChange={e => setFiltroDataFim(e.target.value)} />
          </div>
          <div>
            <label className="block text-xs md:text-sm text-gray-400 mb-1">Categoria</label>
            <select className={selectClass} value={filtroCategoria} onChange={e => setFiltroCategoria(e.target.value)}>
              <option value="">Todas</option>
              <option value="ALIMENTACAO">Alimentação</option>
              <option value="TRANSPORTE">Transporte</option>
              <option value="MATERIAL">Material</option>
            </select>
          </div>
          <div className="flex items-end">
            <button onClick={limparFiltros} className={btnSecondary}>
              <X className="w-3 h-3 md:w-4 md:h-4" /> Limpar
            </button>
          </div>
        </div>
      </div>

      <form onSubmit={adicionar} className="bg-gray-900/60 backdrop-blur-sm p-3 md:p-6 rounded-xl mb-4 md:mb-8 border border-gray-800/50">
        <h2 className="text-base md:text-xl font-semibold text-amber-500 mb-3 md:mb-4">Novo Gasto</h2>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-2 md:gap-4">
          <select className={selectClass} value={form.categoria} onChange={e => setForm({ ...form, categoria: e.target.value })}>
            <option value="ALIMENTACAO">Alimentação</option>
            <option value="TRANSPORTE">Transporte</option>
            <option value="MATERIAL">Material</option>
          </select>
          <input required type="number" min="0" step="0.01" className={inputClass} placeholder="Quantidade" value={form.quantidade} onChange={e => setForm({ ...form, quantidade: e.target.value })} />
          <input required type="number" min="0" step="0.01" className={inputClass} placeholder="Valor Unitário" value={form.valorUnitario} onChange={e => setForm({ ...form, valorUnitario: e.target.value })} />
          <input className={inputClass} placeholder="Descrição" value={form.descricao} onChange={e => setForm({ ...form, descricao: e.target.value })} />
          <input required type="date" className={inputClass} value={form.dataGasto} onChange={e => setForm({ ...form, dataGasto: e.target.value })} />
          <button type="submit" className={btnPrimary}>
            <Plus className="w-3 h-3 md:w-4 md:h-4" /> Registrar
          </button>
        </div>
      </form>

      {gastos.length > 0 && (
        <div className="flex justify-between items-center mb-3 md:mb-6 bg-gray-900/60 backdrop-blur-sm p-3 md:p-4 rounded-xl border border-gray-800/50">
          <span className="text-sm md:text-lg font-medium">Total Geral:</span>
          <span className="text-lg md:text-2xl font-bold text-green-400">R$ {totalGeral.toFixed(2)}</span>
        </div>
      )}

      <div className="space-y-2 md:space-y-4">
        {gastos.map(g => (
          <div key={g.id} className="bg-gray-900/60 backdrop-blur-sm p-3 md:p-4 rounded-xl border border-gray-800/50 flex flex-col md:flex-row justify-between items-start md:items-center gap-2 md:gap-4 hover:border-amber-500/30 transition-all">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <span className="text-amber-500 font-bold text-sm md:text-lg">{g.categoria}</span>
                <span className="text-gray-400 text-xs md:text-sm">- {formatDate(g.dataGasto)}</span>
              </div>
              <p className="text-base md:text-xl font-semibold">R$ {g.valor.toFixed(2)}</p>
              {g.descricao && <p className="text-gray-400 text-xs md:text-sm mt-1">{g.descricao}</p>}
            </div>
            <div className="flex gap-1 md:gap-2">
              <button onClick={() => iniciarEdicao(g)} className="bg-blue-600 hover:bg-blue-700 text-white px-2 py-1 md:px-3 md:py-1 rounded-lg flex items-center gap-1 transition text-xs md:text-sm">
                <Pencil className="w-3 h-3 md:w-4 md:h-4" /> Editar
              </button>
              <button onClick={() => remover(g.id)} className="bg-red-600 hover:bg-red-700 text-white px-2 py-1 md:px-3 md:py-1 rounded-lg flex items-center gap-1 transition text-xs md:text-sm">
                <Trash2 className="w-3 h-3 md:w-4 md:h-4" /> Remover
              </button>
            </div>
          </div>
        ))}
        {gastos.length === 0 && (
          <p className="text-gray-400 text-center py-4 text-xs md:text-sm">Nenhum gasto encontrado.</p>
        )}
      </div>

      {editando && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-3">
          <div className="bg-gray-900 border border-gray-800 p-4 md:p-6 rounded-xl w-full max-w-md">
            <h2 className="text-lg md:text-2xl font-bold text-amber-500 mb-4 md:mb-6">Editar Gasto</h2>
            <div className="space-y-3 md:space-y-4">
              <div>
                <label className="block text-xs md:text-sm text-gray-400 mb-1">Categoria</label>
                <select className={selectClass} value={editForm.categoria} onChange={e => setEditForm({...editForm, categoria: e.target.value})}>
                  <option value="ALIMENTACAO">Alimentação</option>
                  <option value="TRANSPORTE">Transporte</option>
                  <option value="MATERIAL">Material</option>
                </select>
              </div>
              <div>
                <label className="block text-xs md:text-sm text-gray-400 mb-1">Valor (R$)</label>
                <input type="number" min="0" step="0.01" className={inputClass} value={editForm.valor} onChange={e => setEditForm({...editForm, valor: e.target.value})} />
              </div>
              <div>
                <label className="block text-xs md:text-sm text-gray-400 mb-1">Descrição</label>
                <input className={inputClass} value={editForm.descricao} onChange={e => setEditForm({...editForm, descricao: e.target.value})} />
              </div>
              <div>
                <label className="block text-xs md:text-sm text-gray-400 mb-1">Data</label>
                <input type="date" className={inputClass} value={editForm.dataGasto} onChange={e => setEditForm({...editForm, dataGasto: e.target.value})} />
              </div>
            </div>
            <div className="flex justify-end gap-2 md:gap-4 mt-4 md:mt-6">
              <button onClick={() => setEditando(null)} className={btnSecondary}>
                <X className="w-3 h-3 md:w-4 md:h-4" /> Cancelar
              </button>
              <button onClick={salvarEdicao} className={btnPrimary}>
                <Pencil className="w-3 h-3 md:w-4 md:h-4" /> Salvar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}