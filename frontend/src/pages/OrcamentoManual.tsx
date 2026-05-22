import { useEffect, useState } from 'react'
import api from '../services/api'
import { gerarPDFOrcamentoManual } from '../services/pdf'

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
    dataCompra: new Date().toISOString().split('T')[0]
  })

  // Estado para edição
  const [editando, setEditando] = useState<OrcamentoItem | null>(null)
  const [editForm, setEditForm] = useState({
    descricao: '',
    quantidade: '1',
    valorUnitario: '',
    dataCompra: ''
  })

  // Filtros
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
      dataCompra: new Date().toISOString().split('T')[0]
    })
    carregar()
  }

  const excluir = async (id: string) => {
    if (!window.confirm('Excluir este item?')) return
    await api.delete(`/orcamento-itens/${id}`)
    carregar()
  }

  // Abre o modal de edição
  const iniciarEdicao = (item: OrcamentoItem) => {
    setEditando(item)
    setEditForm({
      descricao: item.descricao,
      quantidade: item.quantidade.toString(),
      valorUnitario: item.valorUnitario.toString(),
      dataCompra: item.dataCompra.split('T')[0]
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

  return (
    <div className="min-h-screen bg-gray-900 text-white p-8">
      <h1 className="text-3xl font-bold text-amber-500 mb-8">Orçamento Manual</h1>

      {/* Filtros por data */}
      <div className="bg-gray-800 p-4 rounded-lg mb-6 grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
        <div>
          <label className="block text-sm text-gray-400 mb-1">Data Início</label>
          <input type="date" className="w-full p-2 rounded bg-gray-700" value={filtroDataInicio} onChange={e => setFiltroDataInicio(e.target.value)} />
        </div>
        <div>
          <label className="block text-sm text-gray-400 mb-1">Data Fim</label>
          <input type="date" className="w-full p-2 rounded bg-gray-700" value={filtroDataFim} onChange={e => setFiltroDataFim(e.target.value)} />
        </div>
        <button onClick={() => { setFiltroDataInicio(''); setFiltroDataFim('') }} className="bg-gray-600 hover:bg-gray-500 text-white font-bold py-2 px-4 rounded h-[42px]">
          Limpar Filtros
        </button>
      </div>

      {/* Formulário de cadastro */}
      <form onSubmit={adicionar} className="bg-gray-800 p-6 rounded-lg mb-8 grid grid-cols-2 gap-4">
        <input required className="p-2 rounded bg-gray-700" placeholder="Descrição (material/ferramenta)" value={form.descricao} onChange={e => setForm({...form, descricao: e.target.value})} />
        <input required type="number" min="1" className="p-2 rounded bg-gray-700" placeholder="Quantidade" value={form.quantidade} onChange={e => setForm({...form, quantidade: e.target.value})} />
        <input required type="number" min="0" step="0.01" className="p-2 rounded bg-gray-700" placeholder="Valor Unitário" value={form.valorUnitario} onChange={e => setForm({...form, valorUnitario: e.target.value})} />
        <input required type="date" className="p-2 rounded bg-gray-700" value={form.dataCompra} onChange={e => setForm({...form, dataCompra: e.target.value})} />
        <button type="submit" className="col-span-2 bg-amber-500 text-black font-bold py-2 rounded">Adicionar Item</button>
      </form>

      {/* Total geral + Exportar PDF */}
      {itens.length > 0 && (
        <div className="flex justify-between items-center mb-4">
          <div className="text-xl font-bold text-green-400">
            Total Geral do Orçamento: R$ {totalGeral.toFixed(2)}
          </div>
          <button
            onClick={() => gerarPDFOrcamentoManual(itens)}
            className="bg-red-700 hover:bg-red-800 text-white font-bold py-2 px-4 rounded disabled:opacity-50"
          >
            Exportar PDF
          </button>
        </div>
      )}

      {/* Lista de itens */}
      <div className="grid gap-4">
        {itens.map(item => {
          const subtotal = item.quantidade * item.valorUnitario
          return (
            <div key={item.id} className="bg-gray-800 p-4 rounded flex justify-between items-center">
              <div>
                <strong className="text-amber-500">{item.descricao}</strong><br />
                Quantidade: {item.quantidade} | Valor Unit.: R$ {item.valorUnitario.toFixed(2)} | Subtotal: R$ {subtotal.toFixed(2)}<br />
                <span className="text-gray-400 text-sm">Data: {new Date(item.dataCompra).toLocaleDateString('pt-BR')}</span>
              </div>
              <div className="flex gap-2">
                <button onClick={() => iniciarEdicao(item)} className="bg-blue-600 px-4 py-1 rounded hover:bg-blue-700">Editar</button>
                <button onClick={() => excluir(item.id)} className="bg-red-600 px-4 py-1 rounded hover:bg-red-700">Excluir</button>
              </div>
            </div>
          )
        })}
        {itens.length === 0 && (
          <p className="text-gray-400 text-center">Nenhum item cadastrado.</p>
        )}
      </div>

      {/* Modal de edição */}
      {editando && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-gray-800 p-8 rounded-lg w-full max-w-lg">
            <h2 className="text-2xl font-bold text-amber-500 mb-6">Editar Item</h2>
            <div className="mb-4">
              <label className="block text-sm text-gray-400 mb-1">Descrição</label>
              <input className="w-full p-2 rounded bg-gray-700" value={editForm.descricao} onChange={e => setEditForm({...editForm, descricao: e.target.value})} />
            </div>
            <div className="mb-4 flex gap-4">
              <div className="flex-1">
                <label className="block text-sm text-gray-400 mb-1">Quantidade</label>
                <input type="number" min="1" className="w-full p-2 rounded bg-gray-700" value={editForm.quantidade} onChange={e => setEditForm({...editForm, quantidade: e.target.value})} />
              </div>
              <div className="flex-1">
                <label className="block text-sm text-gray-400 mb-1">Valor Unitário</label>
                <input type="number" min="0" step="0.01" className="w-full p-2 rounded bg-gray-700" value={editForm.valorUnitario} onChange={e => setEditForm({...editForm, valorUnitario: e.target.value})} />
              </div>
            </div>
            <div className="mb-6">
              <label className="block text-sm text-gray-400 mb-1">Data da Compra</label>
              <input type="date" className="w-full p-2 rounded bg-gray-700" value={editForm.dataCompra} onChange={e => setEditForm({...editForm, dataCompra: e.target.value})} />
            </div>
            <div className="flex justify-end gap-4">
              <button onClick={() => setEditando(null)} className="bg-gray-600 hover:bg-gray-500 text-white font-bold py-2 px-6 rounded">Cancelar</button>
              <button onClick={salvarEdicao} className="bg-amber-500 text-black font-bold py-2 px-6 rounded">Salvar</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}