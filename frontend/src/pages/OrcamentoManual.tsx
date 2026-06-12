import { useEffect, useState } from 'react'
import api from '../services/api'
import { gerarPDFOrcamentoManual } from '../services/pdf'
import { formatDate, getTodayLocal } from '../utils/date'
import { Pencil, Trash2, Plus, FileText, X } from 'lucide-react'

interface OrcamentoItem {
  id: string
  descricao: string
  quantidade: number
  valorUnitario: number
  dataCompra: string
}

export default function OrcamentoManual() {
  const [itens, setItens] = useState<OrcamentoItem[]>([])
  const [form, setForm] = useState({
    descricao: '',
    quantidade: '1',
    valorUnitario: '',
    dataCompra: getTodayLocal()
  })

  const [editando, setEditando] = useState<OrcamentoItem | null>(null)
  const [editForm, setEditForm] = useState({
    descricao: '',
    quantidade: '1',
    valorUnitario: '',
    dataCompra: ''
  })

  const [filtroDataInicio, setFiltroDataInicio] = useState('')
  const [filtroDataFim, setFiltroDataFim] = useState('')

  const carregar = async () => {
    const params: any = {}
    if (filtroDataInicio) params.dataInicio = filtroDataInicio
    if (filtroDataFim) params.dataFim = filtroDataFim

    const { data } = await api.get('/orcamento-itens', { params })
    setItens(data.map((item: any) => ({
      ...item,
      valorUnitario: Number(item.valorUnitario)
    })))
  }

  const adicionar = async (e: React.FormEvent) => {
    e.preventDefault()
    await api.post('/orcamento-itens', {
      descricao: form.descricao,
      quantidade: parseInt(form.quantidade) || 1,
      valorUnitario: parseFloat(form.valorUnitario),
      dataCompra: form.dataCompra
    })
    setForm({
      descricao: '',
      quantidade: '1',
      valorUnitario: '',
      dataCompra: getTodayLocal()
    })
    carregar()
  }

  const excluir = async (id: string) => {
    if (!window.confirm('Excluir este item?')) return
    await api.delete(`/orcamento-itens/${id}`)
    carregar()
  }

  const iniciarEdicao = (item: OrcamentoItem) => {
    setEditando(item)
    setEditForm({
      descricao: item.descricao,
      quantidade: item.quantidade.toString(),
      valorUnitario: item.valorUnitario.toString(),
      dataCompra: item.dataCompra
    })
  }

  const salvarEdicao = async () => {
    if (!editando) return
    await api.put(`/orcamento-itens/${editando.id}`, {
      descricao: editForm.descricao,
      quantidade: parseInt(editForm.quantidade) || 1,
      valorUnitario: parseFloat(editForm.valorUnitario),
      dataCompra: editForm.dataCompra
    })
    setEditando(null)
    carregar()
  }

  useEffect(() => {
    carregar()
  }, [filtroDataInicio, filtroDataFim])

  const totalGeral = itens.reduce((acc, item) => acc + (item.quantidade * item.valorUnitario), 0)

  const inputClass = "w-full px-2 py-1.5 md:px-3 md:py-2 rounded-lg bg-gray-900/50 border border-gray-700 text-white placeholder-gray-400 focus:border-amber-500 focus:ring-1 focus:ring-amber-500 transition text-sm md:text-base"
  const btnPrimary = "bg-amber-500 hover:bg-amber-600 text-black font-semibold py-1.5 px-3 md:py-2 md:px-4 rounded-lg transition-all flex items-center gap-1 md:gap-2 text-xs md:text-sm"
  const btnSecondary = "bg-gray-700 hover:bg-gray-600 text-white font-medium py-1.5 px-3 md:py-2 md:px-4 rounded-lg transition-all flex items-center gap-1 md:gap-2 text-xs md:text-sm"

  return (
    <div className="min-h-screen bg-gray-950 text-white p-3 md:p-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-4 md:mb-8 gap-3">
        <h1 className="text-xl md:text-3xl font-bold text-amber-500 flex items-center gap-2 md:gap-3">
          <FileText className="w-6 h-6 md:w-8 md:h-8" />
          Orçamento Manual
        </h1>
        {itens.length > 0 && (
          <button onClick={() => gerarPDFOrcamentoManual(itens)} className="bg-red-700 hover:bg-red-800 text-white font-bold py-1.5 px-3 md:py-2 md:px-4 rounded-lg transition-all text-xs md:text-sm">
            Exportar PDF
          </button>
        )}
      </div>

      <div className="bg-gray-900/60 backdrop-blur-sm p-3 md:p-4 rounded-xl mb-4 md:mb-8 border border-gray-800/50">
        <div className="grid grid-cols-2 md:grid-cols-3 gap-2 md:gap-4 items-end">
          <div>
            <label className="block text-xs md:text-sm text-gray-400 mb-1">Início</label>
            <input type="date" className={inputClass} value={filtroDataInicio} onChange={e => setFiltroDataInicio(e.target.value)} />
          </div>
          <div>
            <label className="block text-xs md:text-sm text-gray-400 mb-1">Fim</label>
            <input type="date" className={inputClass} value={filtroDataFim} onChange={e => setFiltroDataFim(e.target.value)} />
          </div>
          <button onClick={() => { setFiltroDataInicio(''); setFiltroDataFim('') }} className={btnSecondary}>
            <X className="w-3 h-3 md:w-4 md:h-4" /> Limpar
          </button>
        </div>
      </div>

      <form onSubmit={adicionar} className="bg-gray-900/60 backdrop-blur-sm p-3 md:p-6 rounded-xl mb-4 md:mb-8 border border-gray-800/50">
        <h2 className="text-base md:text-xl font-semibold text-amber-500 mb-3 md:mb-4">Novo Item</h2>
        <div className="grid grid-cols-2 gap-2 md:gap-4">
          <input required className={inputClass} placeholder="Descrição" value={form.descricao} onChange={e => setForm({...form, descricao: e.target.value})} />
          <input required type="number" min="1" className={inputClass} placeholder="Quantidade" value={form.quantidade} onChange={e => setForm({...form, quantidade: e.target.value})} />
          <input required type="number" min="0" step="0.01" className={inputClass} placeholder="Valor Unitário" value={form.valorUnitario} onChange={e => setForm({...form, valorUnitario: e.target.value})} />
          <input required type="date" className={inputClass} value={form.dataCompra} onChange={e => setForm({...form, dataCompra: e.target.value})} />
          <button type="submit" className={`${btnPrimary} col-span-2`}>
            <Plus className="w-3 h-3 md:w-4 md:h-4" /> Adicionar Item
          </button>
        </div>
      </form>

      {itens.length > 0 && (
        <div className="flex justify-between items-center mb-3 md:mb-6 bg-gray-900/60 backdrop-blur-sm p-3 md:p-4 rounded-xl border border-gray-800/50">
          <span className="text-sm md:text-lg font-medium">Total Geral do Orçamento:</span>
          <span className="text-lg md:text-2xl font-bold text-green-400">R$ {totalGeral.toFixed(2)}</span>
        </div>
      )}

      <div className="space-y-2 md:space-y-4">
        {itens.map(item => {
          const subtotal = item.quantidade * item.valorUnitario
          return (
            <div key={item.id} className="bg-gray-900/60 backdrop-blur-sm p-3 md:p-4 rounded-xl border border-gray-800/50 flex flex-col md:flex-row justify-between items-start md:items-center gap-2 md:gap-4 hover:border-amber-500/30 transition-all">
              <div>
                <strong className="text-amber-500 text-sm md:text-lg">{item.descricao}</strong><br />
                <span className="text-xs md:text-sm">Quantidade: {item.quantidade} | Valor Unit.: R$ {item.valorUnitario.toFixed(2)} | Subtotal: R$ {subtotal.toFixed(2)}</span><br />
                <span className="text-gray-400 text-xs md:text-sm">Data: {formatDate(item.dataCompra)}</span>
              </div>
              <div className="flex gap-1 md:gap-2">
                <button onClick={() => iniciarEdicao(item)} className="bg-blue-600 hover:bg-blue-700 text-white px-2 py-1 md:px-3 md:py-1 rounded-lg flex items-center gap-1 transition text-xs md:text-sm">
                  <Pencil className="w-3 h-3 md:w-4 md:h-4" /> Editar
                </button>
                <button onClick={() => excluir(item.id)} className="bg-red-600 hover:bg-red-700 text-white px-2 py-1 md:px-3 md:py-1 rounded-lg flex items-center gap-1 transition text-xs md:text-sm">
                  <Trash2 className="w-3 h-3 md:w-4 md:h-4" /> Excluir
                </button>
              </div>
            </div>
          )
        })}
        {itens.length === 0 && (
          <p className="text-gray-400 text-center py-4 text-xs md:text-sm">Nenhum item cadastrado.</p>
        )}
      </div>

      {editando && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-3">
          <div className="bg-gray-900 border border-gray-800 p-4 md:p-6 rounded-xl w-full max-w-md">
            <h2 className="text-lg md:text-2xl font-bold text-amber-500 mb-4 md:mb-6">Editar Item</h2>
            <div className="space-y-3 md:space-y-4">
              <div>
                <label className="block text-xs md:text-sm text-gray-400 mb-1">Descrição</label>
                <input className={inputClass} value={editForm.descricao} onChange={e => setEditForm({...editForm, descricao: e.target.value})} />
              </div>
              <div className="flex gap-2 md:gap-4">
                <div className="flex-1">
                  <label className="block text-xs md:text-sm text-gray-400 mb-1">Quantidade</label>
                  <input type="number" min="1" className={inputClass} value={editForm.quantidade} onChange={e => setEditForm({...editForm, quantidade: e.target.value})} />
                </div>
                <div className="flex-1">
                  <label className="block text-xs md:text-sm text-gray-400 mb-1">Valor Unitário</label>
                  <input type="number" min="0" step="0.01" className={inputClass} value={editForm.valorUnitario} onChange={e => setEditForm({...editForm, valorUnitario: e.target.value})} />
                </div>
              </div>
              <div>
                <label className="block text-xs md:text-sm text-gray-400 mb-1">Data da Compra</label>
                <input type="date" className={inputClass} value={editForm.dataCompra} onChange={e => setEditForm({...editForm, dataCompra: e.target.value})} />
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