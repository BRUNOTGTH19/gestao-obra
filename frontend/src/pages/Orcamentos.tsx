import { useState } from 'react'
import api from '../services/api'

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

  return (
    <div className="min-h-screen bg-gray-900 text-white p-8">
      <h1 className="text-3xl font-bold text-amber-500 mb-8">Orçamento com IA</h1>
      
      <div className="bg-gray-800 p-6 rounded-lg mb-8">
        {insumos.map((insumo, idx) => (
          <div key={idx} className="flex gap-4 mb-4">
            <input className="p-2 rounded bg-gray-700 flex-1" placeholder="Descrição" value={insumo.descricao} onChange={e => {
              const novo = [...insumos]; novo[idx].descricao = e.target.value; setInsumos(novo)
            }} />
            <input type="number" className="p-2 rounded bg-gray-700 w-24" placeholder="Qtd" value={insumo.quantidade} onChange={e => {
              const novo = [...insumos]; novo[idx].quantidade = e.target.value; setInsumos(novo)
            }} />
            <input className="p-2 rounded bg-gray-700 w-24" placeholder="Un." value={insumo.unidade} onChange={e => {
              const novo = [...insumos]; novo[idx].unidade = e.target.value; setInsumos(novo)
            }} />
          </div>
        ))}
        <div className="flex gap-4">
          <button onClick={adicionarInsumo} className="bg-gray-700 px-4 py-2 rounded">+ Insumo</button>
          <button onClick={gerar} disabled={loading} className="bg-amber-500 text-black font-bold px-6 py-2 rounded">
            {loading ? 'Gerando...' : 'Gerar Orçamento'}
          </button>
        </div>
      </div>

      {orcamento && (
        <div className="bg-gray-800 p-6 rounded-lg">
          <h2 className="text-xl font-bold text-amber-500 mb-4">Resultado</h2>
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
          <div className="text-right mt-4 text-xl font-bold text-amber-500">
            Total Geral: R$ {orcamento.totalGeral}
          </div>
          {orcamento.observacoes && <p className="mt-2 text-gray-400">{orcamento.observacoes}</p>}
        </div>
      )}
    </div>
  )
}