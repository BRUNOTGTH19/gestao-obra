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

  const inputClass = "w-full px-2 py-1.5 md:px-3 md:py-2 rounded-lg bg-gray-900/50 border border-gray-700 text-white placeholder-gray-400 focus:border-amber-500 focus:ring-1 focus:ring-amber-500 transition text-sm md:text-base"
  const btnPrimary = "bg-amber-500 hover:bg-amber-600 text-black font-semibold py-1.5 px-3 md:py-2 md:px-4 rounded-lg transition-all flex items-center gap-1 md:gap-2 text-xs md:text-sm"
  const btnSecondary = "bg-gray-700 hover:bg-gray-600 text-white font-medium py-1.5 px-3 md:py-2 md:px-4 rounded-lg transition-all flex items-center gap-1 md:gap-2 text-xs md:text-sm"

  return (
    <div className="min-h-screen bg-gray-950 text-white p-3 md:p-8">
      <div className="flex items-center gap-2 md:gap-3 mb-4 md:mb-8">
        <Calculator className="w-6 h-6 md:w-8 md:h-8 text-amber-500" />
        <h1 className="text-xl md:text-3xl font-bold text-amber-500">Orçamento com IA</h1>
      </div>

      <div className="bg-gray-900/60 backdrop-blur-sm p-3 md:p-6 rounded-xl mb-4 md:mb-8 border border-gray-800/50">
        <h2 className="text-base md:text-xl font-semibold text-amber-500 mb-3 md:mb-4">Insumos</h2>
        {insumos.map((insumo, idx) => (
          <div key={idx} className="flex gap-2 md:gap-4 mb-2 md:mb-4">
            <input className={inputClass} placeholder="Descrição" value={insumo.descricao} onChange={e => {
              const novo = [...insumos]; novo[idx].descricao = e.target.value; setInsumos(novo)
            }} />
            <input type="number" className={inputClass + " w-16 md:w-24"} placeholder="Qtd" value={insumo.quantidade} onChange={e => {
              const novo = [...insumos]; novo[idx].quantidade = e.target.value; setInsumos(novo)
            }} />
            <input className={inputClass + " w-16 md:w-24"} placeholder="Un." value={insumo.unidade} onChange={e => {
              const novo = [...insumos]; novo[idx].unidade = e.target.value; setInsumos(novo)
            }} />
          </div>
        ))}
        <div className="flex gap-2 md:gap-4">
          <button onClick={adicionarInsumo} className={btnSecondary}>
            <Plus className="w-3 h-3 md:w-4 md:h-4" /> Insumo
          </button>
          <button onClick={gerar} disabled={loading} className={btnPrimary}>
            {loading ? 'Gerando...' : 'Gerar Orçamento'}
          </button>
        </div>
      </div>

      {orcamento && (
        <div className="bg-gray-900/60 backdrop-blur-sm p-3 md:p-6 rounded-xl border border-gray-800/50">
          <h2 className="text-base md:text-xl font-semibold text-amber-500 mb-3 md:mb-4">Resultado</h2>
          <div className="overflow-x-auto">
            <table className="w-full text-xs md:text-sm">
              <thead>
                <tr className="text-left text-gray-400">
                  <th className="py-1 md:py-2">Item</th>
                  <th className="py-1 md:py-2">Qtd</th>
                  <th className="py-1 md:py-2">Preço Unit.</th>
                  <th className="py-1 md:py-2">Total</th>
                </tr>
              </thead>
              <tbody>
                {orcamento.itens.map((item: any, idx: number) => (
                  <tr key={idx} className="border-t border-gray-700">
                    <td className="py-1 md:py-2">{item.descricao}</td>
                    <td className="py-1 md:py-2">{item.quantidade} {item.unidade}</td>
                    <td className="py-1 md:py-2">R$ {item.precoUnitario}</td>
                    <td className="py-1 md:py-2">R$ {item.total}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="text-right mt-3 md:mt-4 text-base md:text-xl font-bold text-green-400">
            Total Geral: R$ {orcamento.totalGeral}
          </div>
          {orcamento.observacoes && <p className="mt-2 text-gray-400 text-xs md:text-sm">{orcamento.observacoes}</p>}
        </div>
      )}
    </div>
  )
}