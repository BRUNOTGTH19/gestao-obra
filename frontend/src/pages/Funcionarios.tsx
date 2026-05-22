import { useEffect, useState } from 'react'
import api from '../services/api'
import { gerarPDFFuncionarios } from '../services/pdf'

interface Funcionario {
  id: string
  nome: string
  telefone: string
  profissao: string
  valorDiaria: number
  diasTrabalhados: number
  datasTrabalhadas: string[]  // array de datas "YYYY-MM-DD"
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

  // Estado para o modal de edição
  const [editando, setEditando] = useState<Funcionario | null>(null)
  const [editDias, setEditDias] = useState<number>(0)
  const [editDatas, setEditDatas] = useState<string[]>([])

  const carregar = async () => {
    const params: any = {}
    if (busca.trim()) params.nome = busca.trim()

    const { data } = await api.get('/funcionarios', { params })
    // Converte valorDiaria para número e garante que datasTrabalhadas seja array
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

  // Abre o modal de edição com os dados atuais
  const abrirEdicao = (func: Funcionario) => {
    setEditando(func)
    setEditDias(func.diasTrabalhados)
    setEditDatas(func.datasTrabalhadas || [])
  }

  // Adiciona uma data no array de edição
  const adicionarData = () => {
    setEditDatas([...editDatas, ''])
  }

  // Atualiza uma data específica
  const atualizarData = (index: number, valor: string) => {
    const novas = [...editDatas]
    novas[index] = valor
    setEditDatas(novas)
  }

  // Remove uma data
  const removerData = (index: number) => {
    setEditDatas(editDatas.filter((_, i) => i !== index))
  }

  // Salva as alterações
  const salvarEdicao = async () => {
    if (!editando) return
    // Filtra datas vazias
    const datasLimpa = editDatas.filter(d => d.trim() !== '')
    await api.put(`/funcionarios/${editando.id}`, {
      diasTrabalhados: editDias,
      datasTrabalhadas: datasLimpa
    })
    setEditando(null)
    carregar()
  }

  // Recarrega sempre que a busca mudar
  useEffect(() => {
    carregar()
  }, [busca])

  return (
    <div className="min-h-screen bg-gray-900 text-white p-8">
      <h1 className="text-3xl font-bold text-amber-500 mb-8">Funcionários</h1>

      {/* Busca por nome */}
      <div className="bg-gray-800 p-4 rounded-lg mb-6 flex flex-wrap gap-4 items-end">
        <div className="flex-1 min-w-[200px]">
          <label className="block text-sm text-gray-400 mb-1">Buscar por nome</label>
          <input
            type="text"
            className="w-full p-2 rounded bg-gray-700"
            placeholder="Digite parte do nome..."
            value={busca}
            onChange={(e) => setBusca(e.target.value)}
          />
        </div>
        <button
          onClick={() => setBusca('')}
          className="bg-gray-600 hover:bg-gray-500 text-white font-bold py-2 px-4 rounded h-[42px]"
        >
          Limpar busca
        </button>
      </div>

      {/* Formulário de cadastro */}
      <form onSubmit={adicionar} className="bg-gray-800 p-6 rounded-lg mb-8 grid grid-cols-2 gap-4">
        <input required className="p-2 rounded bg-gray-700" placeholder="Nome" value={form.nome} onChange={e => setForm({ ...form, nome: e.target.value })} />
        <input required className="p-2 rounded bg-gray-700" placeholder="Telefone" value={form.telefone} onChange={e => setForm({ ...form, telefone: e.target.value })} />
        <input required className="p-2 rounded bg-gray-700" placeholder="Profissão" value={form.profissao} onChange={e => setForm({ ...form, profissao: e.target.value })} />
        <input required type="number" step="0.01" className="p-2 rounded bg-gray-700" placeholder="Valor Diária" value={form.valorDiaria} onChange={e => setForm({ ...form, valorDiaria: e.target.value })} />
        <input required type="number" min="0" className="p-2 rounded bg-gray-700" placeholder="Dias Trabalhados" value={form.diasTrabalhados} onChange={e => setForm({ ...form, diasTrabalhados: e.target.value })} />
        <select className="p-2 rounded bg-gray-700" value={form.tipoContrato} onChange={e => setForm({ ...form, tipoContrato: e.target.value })}>
          <option value="CLT">CLT</option>
          <option value="PJ">PJ</option>
          <option value="TEMPORARIO">Temporário</option>
        </select>
        <button type="submit" className="col-span-2 bg-amber-500 text-black font-bold py-2 rounded">Adicionar</button>
      </form>

      {/* Botão de exportação + título da lista */}
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-bold text-amber-500">Lista de Funcionários</h2>
        <button
          onClick={() => gerarPDFFuncionarios(funcionarios)}
          disabled={funcionarios.length === 0}
          className="bg-red-700 hover:bg-red-800 text-white font-bold py-2 px-4 rounded disabled:opacity-50"
        >
          Exportar PDF
        </button>
      </div>

      {/* Listagem com total e botão de editar */}
      <div className="grid gap-4">
        {funcionarios.map(f => {
          const total = f.valorDiaria * f.diasTrabalhados
          return (
            <div key={f.id} className="bg-gray-800 p-4 rounded flex justify-between items-center">
              <div className="flex-1">
                <strong className="text-amber-500">{f.nome}</strong> - {f.profissao}<br />
                Diária: R$ {f.valorDiaria.toFixed(2)} | Dias: {f.diasTrabalhados} | Total: <span className="text-green-400 font-bold">R$ {total.toFixed(2)}</span>
                {f.datasTrabalhadas.length > 0 && (
                  <div className="text-gray-400 text-sm mt-1">
                    Datas: {f.datasTrabalhadas.join(', ')}
                  </div>
                )}
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => abrirEdicao(f)}
                  className="bg-blue-600 px-4 py-1 rounded hover:bg-blue-700 transition"
                >
                  Editar
                </button>
                <button onClick={() => remover(f.id)} className="bg-red-600 px-4 py-1 rounded hover:bg-red-700 transition">
                  Remover
                </button>
              </div>
            </div>
          )
        })}
        {funcionarios.length === 0 && (
          <p className="text-gray-400 text-center">Nenhum funcionário encontrado.</p>
        )}
      </div>

      {/* Modal de edição */}
      {editando && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-gray-800 p-8 rounded-lg w-full max-w-lg">
            <h2 className="text-2xl font-bold text-amber-500 mb-6">Editar: {editando.nome}</h2>
            
            <div className="mb-4">
              <label className="block text-sm text-gray-400 mb-1">Dias Trabalhados</label>
              <input
                type="number"
                min="0"
                className="w-full p-2 rounded bg-gray-700"
                value={editDias}
                onChange={(e) => setEditDias(parseInt(e.target.value) || 0)}
              />
            </div>

            <div className="mb-6">
              <label className="block text-sm text-gray-400 mb-2">Datas Trabalhadas</label>
              {editDatas.map((data, idx) => (
                <div key={idx} className="flex gap-2 mb-2">
                  <input
                    type="date"
                    className="flex-1 p-2 rounded bg-gray-700"
                    value={data}
                    onChange={(e) => atualizarData(idx, e.target.value)}
                  />
                  <button
                    onClick={() => removerData(idx)}
                    className="bg-red-600 px-2 rounded hover:bg-red-700"
                  >
                    ✕
                  </button>
                </div>
              ))}
              <button
                onClick={adicionarData}
                className="bg-gray-600 hover:bg-gray-500 text-white font-bold py-1 px-4 rounded mt-2"
              >
                + Adicionar Data
              </button>
            </div>

            <div className="flex justify-end gap-4">
              <button
                onClick={() => setEditando(null)}
                className="bg-gray-600 hover:bg-gray-500 text-white font-bold py-2 px-6 rounded"
              >
                Cancelar
              </button>
              <button
                onClick={salvarEdicao}
                className="bg-amber-500 text-black font-bold py-2 px-6 rounded hover:bg-amber-600"
              >
                Salvar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}