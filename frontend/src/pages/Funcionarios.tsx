import { useEffect, useState } from 'react'
import api from '../services/api'
import { gerarPDFFuncionarios } from '../services/pdf'
import { formatDate, getTodayLocal } from '../utils/date'
import { Pencil, Trash2, Plus, X, Users } from 'lucide-react'

interface Funcionario {
  id: string
  nome: string
  telefone: string
  profissao: string
  valorDiaria: number
  diasTrabalhados: number
  datasTrabalhadas: string[]
  tipoContrato: string
}

export default function Funcionarios() {
  const [funcionarios, setFuncionarios] = useState<Funcionario[]>([])
  const [form, setForm] = useState({
    nome: '',
    telefone: '',
    profissao: '',
    valorDiaria: '',
    diasTrabalhados: '',
    tipoContrato: 'CLT'
  })
  const [busca, setBusca] = useState('')

  const [editando, setEditando] = useState<Funcionario | null>(null)
  const [editDias, setEditDias] = useState<number>(0)
  const [editDatas, setEditDatas] = useState<string[]>([])

  const carregar = async () => {
    const params: any = {}
    if (busca.trim()) params.nome = busca.trim()

    const { data } = await api.get('/funcionarios', { params })
    const lista = data.map((f: any) => ({
      ...f,
      valorDiaria: Number(f.valorDiaria),
      datasTrabalhadas: Array.isArray(f.datasTrabalhadas)
        ? f.datasTrabalhadas
        : (typeof f.datasTrabalhadas === 'string' && f.datasTrabalhadas.trim() !== ''
            ? JSON.parse(f.datasTrabalhadas)
            : [])
    }))
    setFuncionarios(lista)
  }

  const adicionar = async (e: React.FormEvent) => {
    e.preventDefault()
    await api.post('/funcionarios', {
      nome: form.nome,
      telefone: form.telefone,
      profissao: form.profissao,
      valorDiaria: parseFloat(form.valorDiaria),
      diasTrabalhados: parseInt(form.diasTrabalhados) || 0,
      tipoContrato: form.tipoContrato
    })
    setForm({
      nome: '',
      telefone: '',
      profissao: '',
      valorDiaria: '',
      diasTrabalhados: '',
      tipoContrato: 'CLT'
    })
    carregar()
  }

  const remover = async (id: string) => {
    if (!window.confirm('Deseja realmente remover este funcionário?')) return
    await api.delete(`/funcionarios/${id}`)
    carregar()
  }

  const abrirEdicao = (func: Funcionario) => {
    setEditando(func)
    setEditDias(func.diasTrabalhados)
    setEditDatas(func.datasTrabalhadas || [])
  }

  const adicionarData = () => {
    setEditDatas([...editDatas, getTodayLocal()])
  }

  const atualizarData = (index: number, valor: string) => {
    const novas = [...editDatas]
    novas[index] = valor
    setEditDatas(novas)
  }

  const removerData = (index: number) => {
    setEditDatas(editDatas.filter((_, i) => i !== index))
  }

  const salvarEdicao = async () => {
    if (!editando) return
    const datasLimpa = editDatas.filter(d => d.trim() !== '')
    await api.put(`/funcionarios/${editando.id}`, {
      diasTrabalhados: editDias,
      datasTrabalhadas: datasLimpa
    })
    setEditando(null)
    carregar()
  }

  useEffect(() => {
    carregar()
  }, [busca])

  const inputClass = "w-full px-3 py-2 rounded-lg bg-gray-900/50 border border-gray-700 text-white placeholder-gray-400 focus:border-amber-500 focus:ring-1 focus:ring-amber-500 transition"
  const selectClass = "w-full px-3 py-2 rounded-lg bg-gray-900/50 border border-gray-700 text-white focus:border-amber-500 focus:ring-1 focus:ring-amber-500 transition"
  const btnPrimary = "bg-amber-500 hover:bg-amber-600 text-black font-semibold py-2 px-4 rounded-lg transition-all flex items-center gap-2"
  const btnSecondary = "bg-gray-700 hover:bg-gray-600 text-white font-medium py-2 px-4 rounded-lg transition-all flex items-center gap-2"

  return (
    <div className="min-h-screen bg-gray-950 text-white p-4 md:p-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <h1 className="text-3xl font-bold text-amber-500 flex items-center gap-3">
          <Users className="w-8 h-8" />
          Funcionários
        </h1>
        <button
          onClick={() => gerarPDFFuncionarios(funcionarios)}
          disabled={funcionarios.length === 0}
          className="bg-red-700 hover:bg-red-800 text-white font-bold py-2 px-4 rounded-lg disabled:opacity-50 transition-all"
        >
          Exportar PDF
        </button>
      </div>

      <div className="bg-gray-900/60 backdrop-blur-sm p-4 rounded-xl mb-8 border border-gray-800/50">
        <div className="flex flex-wrap gap-4 items-end">
          <div className="flex-1 min-w-[200px]">
            <label className="block text-sm text-gray-400 mb-1">Buscar por nome</label>
            <input
              type="text"
              className={inputClass}
              placeholder="Digite parte do nome..."
              value={busca}
              onChange={(e) => setBusca(e.target.value)}
            />
          </div>
          <button onClick={() => setBusca('')} className={btnSecondary}>
            <X className="w-4 h-4" /> Limpar
          </button>
        </div>
      </div>

      <form onSubmit={adicionar} className="bg-gray-900/60 backdrop-blur-sm p-6 rounded-xl mb-8 border border-gray-800/50">
        <h2 className="text-xl font-semibold text-amber-500 mb-4">Novo Funcionário</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <input required className={inputClass} placeholder="Nome" value={form.nome} onChange={e => setForm({ ...form, nome: e.target.value })} />
          <input required className={inputClass} placeholder="Telefone" value={form.telefone} onChange={e => setForm({ ...form, telefone: e.target.value })} />
          <input required className={inputClass} placeholder="Profissão" value={form.profissao} onChange={e => setForm({ ...form, profissao: e.target.value })} />
          <input required type="number" step="0.01" className={inputClass} placeholder="Valor Diária" value={form.valorDiaria} onChange={e => setForm({ ...form, valorDiaria: e.target.value })} />
          <input required type="number" min="0" className={inputClass} placeholder="Dias Trabalhados" value={form.diasTrabalhados} onChange={e => setForm({ ...form, diasTrabalhados: e.target.value })} />
          <select className={selectClass} value={form.tipoContrato} onChange={e => setForm({ ...form, tipoContrato: e.target.value })}>
            <option value="CLT">CLT</option>
            <option value="PJ">PJ</option>
            <option value="TEMPORARIO">Temporário</option>
          </select>
          <button type="submit" className={btnPrimary}>
            <Plus className="w-4 h-4" /> Adicionar
          </button>
        </div>
      </form>

      <div className="space-y-4">
        {funcionarios.map(f => {
          const total = f.valorDiaria * f.diasTrabalhados
          return (
            <div key={f.id} className="bg-gray-900/60 backdrop-blur-sm p-4 rounded-xl border border-gray-800/50 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 hover:border-amber-500/30 transition-all">
              <div className="flex-1">
                <strong className="text-amber-500 text-lg">{f.nome}</strong> - {f.profissao}<br />
                Diária: R$ {f.valorDiaria.toFixed(2)} | Dias: {f.diasTrabalhados} | Total: <span className="text-green-400 font-bold">R$ {total.toFixed(2)}</span>
                {f.datasTrabalhadas.length > 0 && (
                  <div className="text-gray-400 text-sm mt-1">
                    Datas: {f.datasTrabalhadas.map(data => formatDate(data)).join(', ')}
                  </div>
                )}
              </div>
              <div className="flex gap-2">
                <button onClick={() => abrirEdicao(f)} className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded-lg flex items-center gap-1 transition">
                  <Pencil className="w-4 h-4" /> Editar
                </button>
                <button onClick={() => remover(f.id)} className="bg-red-600 hover:bg-red-700 text-white px-3 py-1 rounded-lg flex items-center gap-1 transition">
                  <Trash2 className="w-4 h-4" /> Remover
                </button>
              </div>
            </div>
          )
        })}
        {funcionarios.length === 0 && (
          <p className="text-gray-400 text-center py-8">Nenhum funcionário encontrado.</p>
        )}
      </div>

      {editando && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-gray-900 border border-gray-800 p-6 rounded-xl w-full max-w-md">
            <h2 className="text-2xl font-bold text-amber-500 mb-6">Editar: {editando.nome}</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm text-gray-400 mb-1">Dias Trabalhados</label>
                <input type="number" min="0" className={inputClass} value={editDias} onChange={(e) => setEditDias(parseInt(e.target.value) || 0)} />
              </div>
              <div>
                <label className="block text-sm text-gray-400 mb-2">Datas Trabalhadas</label>
                {editDatas.map((data, idx) => (
                  <div key={idx} className="flex gap-2 mb-2">
                    <input type="date" className={inputClass} value={data} onChange={(e) => atualizarData(idx, e.target.value)} />
                    <button onClick={() => removerData(idx)} className="bg-red-600 hover:bg-red-700 text-white px-2 rounded-lg transition">
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ))}
                <button onClick={adicionarData} className={btnSecondary}>
                  <Plus className="w-4 h-4" /> Adicionar Data
                </button>
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