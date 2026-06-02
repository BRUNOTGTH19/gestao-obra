import { useState } from 'react'
import api from '../services/api'
import { Calculator, Plus } from 'lucide-react'

export default function Orcamentos() {
  const [insumos, setInsumos] = useState([{ descricao: '', quantidade: '', unidade: '' }])
  const [orcamento, setOrcamento] = useState<any>(null)
  const [loading, setLoading] = useState(false)

  const adicionarInsumo = () => {
    setInsumos([...insumos, { descricao: '', quantidade: '', unidade: '' }])
  }

  const gerar = async () => {
    setLoading(true)
    try {
      const { data } = await api.post('/orcamentos/gerar', {
        insumos: insumos.map(i => ({ descricao: i.descricao, quantidade: Number(i.quantidade), unidade: i.unidade }))
      })
      setOrcamento(data.orcamento)
    } catch (error: any) {
      alert(error.response?.data?.message || 'Erro ao gerar orçamento')
    } finally {
      setLoading(false)
    }
  }

  const inputClass = "w-full px-3 py-2 rounded-lg bg-gray-900/50 border border-gray-700 text-white placeholder-gray-400 focus:border-amber-500 focus:ring-1 focus:ring-amber-500 transition"
  const btnPrimary = "bg-amber-500 hover:bg-amber-600 text-black font-semibold py-2 px-4 rounded-lg transition-all flex items-center gap-2"
  const btnSecondary = "bg-gray-700 hover:bg-gray-600 text-white font-medium py-2 px-4 rounded-lg transition-all flex items-center gap-2"

  return (
    <div className="min-h-screen bg-gray-950 text-white p-4 md:p-8">
      <div className="flex items-center gap-3 mb-8">
        <Calculator className="w-8 h-8 text-amber-500" />
        <h1 className="text-3xl font-bold text-amber-500">Orçamento com IA</h1>
      </div>

      <div className="bg-gray-900/60 backdrop-blur-sm p-6 rounded-xl mb-8 border border-gray-800/50">
        <h2 className="text-xl font-semibold text-amber-500 mb-4">Insumos</h2>
        {insumos.map((insumo, idx) => (
          <div key={idx} className="flex gap-4 mb-4">
            <input className={inputClass} placeholder="Descrição" value={insumo.descricao} onChange={e => {
              const novo = [...insumos]; novo[idx].descricao = e.target.value; setInsumos(novo)
            }} />
            <input type="number" className={inputClass + " w-24"} placeholder="Qtd" value={insumo.quantidade} onChange={e => {
              const novo = [...insumos]; novo[idx].quantidade = e.target.value; setInsumos(novo)
            }} />
            <input className={inputClass + " w-24"} placeholder="Un." value={insumo.unidade} onChange={e => {
              const novo = [...insumos]; novo[idx].unidade = e.target.value; setInsumos(novo)
            }} />
          </div>
        ))}
        <div className="flex gap-4">
          <button onClick={adicionarInsumo} className={btnSecondary}>
            <Plus className="w-4 h-4" /> Insumo
          </button>
          <button onClick={gerar} disabled={loading} className={btnPrimary}>
            {loading ? 'Gerando...' : 'Gerar Orçamento'}
          </button>
        </div>
      </div>

      {orcamento && (
        <div className="bg-gray-900/60 backdrop-blur-sm p-6 rounded-xl border border-gray-800/50">
          <h2 className="text-xl font-semibold text-amber-500 mb-4">Resultado</h2>
          <table className="w-full">
            <thead>
              <tr className="text-left text-gray-400">
                <th>Item</th>
                <th>Qtd</th>
                <th>Preço Unit.</th>
                <th>Total</th>
              </tr>
            </thead>
            <tbody>
              {orcamento.itens.map((item: any, idx: number) => (
                <tr key={idx} className="border-t border-gray-700">
                  <td className="py-2">{item.descricao}</td>
                  <td>{item.quantidade} {item.unidade}</td>
                  <td>R$ {item.precoUnitario}</td>
                  <td>R$ {item.total}</td>
                </tr>
              ))}
            </tbody>
          </table>
          <div className="text-right mt-4 text-xl font-bold text-green-400">
            Total Geral: R$ {orcamento.totalGeral}
          </div>
          {orcamento.observacoes && <p className="mt-2 text-gray-400">{orcamento.observacoes}</p>}
        </div>
      )}
    </div>
  )
}