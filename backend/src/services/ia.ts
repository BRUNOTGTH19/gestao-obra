import { GoogleGenerativeAI } from '@google/generative-ai'

let genAI: GoogleGenerativeAI | null = null

function getGenAI(): GoogleGenerativeAI {
  if (!process.env.GEMINI_API_KEY) {
    throw new Error('Chave da API Gemini não configurada no servidor')
  }
  if (!genAI) {
    genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY)
  }
  return genAI
}

export async function gerarOrcamento(
  insumos: Array<{ descricao: string; quantidade: number; unidade: string }>
) {
  const client = getGenAI()
  const model = client.getGenerativeModel({ model: 'gemini-2.0-flash' })

  const prompt = `Gere um orçamento profissional para os seguintes insumos:
${insumos.map(i => `- ${i.quantidade} ${i.unidade} de ${i.descricao}`).join('\n')}

Responda **somente** com um JSON válido (sem markdown ou comentários) no seguinte formato:
{ "itens": [{ "descricao": "...", "quantidade": 0, "unidade": "...", "precoUnitario": 0, "total": 0 }], "totalGeral": 0, "observacoes": "..." }`

  const result = await model.generateContent(prompt)
  const response = result.response
  const text = response.text()
  
  // Limpa possível formatação markdown (```json ... ```)
  const jsonString = text.replace(/```json\n?|```/g, '').trim()
  return JSON.parse(jsonString)
}