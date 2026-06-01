import { GoogleGenerativeAI } from '@google/generative-ai'
import { z } from 'zod'

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

// ✅ FIX: Schema Zod para validar a resposta da IA antes de retornar ao cliente
const itemOrcamentoSchema = z.object({
  descricao: z.string(),
  quantidade: z.number(),
  unidade: z.string(),
  precoUnitario: z.number(),
  total: z.number()
})

const orcamentoRespostaSchema = z.object({
  itens: z.array(itemOrcamentoSchema),
  totalGeral: z.number(),
  observacoes: z.string().optional()
})

export type OrcamentoResposta = z.infer<typeof orcamentoRespostaSchema>

export async function gerarOrcamento(
  insumos: Array<{ descricao: string; quantidade: number; unidade: string }>
): Promise<OrcamentoResposta> {
  const client = getGenAI()
  const model = client.getGenerativeModel({ model: 'gemini-2.0-flash' })

  const prompt = `Gere um orçamento profissional para os seguintes insumos:
${insumos.map(i => `- ${i.quantidade} ${i.unidade} de ${i.descricao}`).join('\n')}

Responda **somente** com um JSON válido (sem markdown ou comentários) no seguinte formato:
{ "itens": [{ "descricao": "...", "quantidade": 0, "unidade": "...", "precoUnitario": 0, "total": 0 }], "totalGeral": 0, "observacoes": "..." }`

  const result = await model.generateContent(prompt)
  const text = result.response.text()

  // Remove possível formatação markdown (```json ... ```)
  const jsonString = text.replace(/```json\n?|```/g, '').trim()

  let parsed: unknown
  try {
    parsed = JSON.parse(jsonString)
  } catch {
    throw new Error('A IA retornou um JSON inválido. Tente novamente.')
  }

  // ✅ FIX: Valida o JSON da IA com Zod — erros de formato são capturados antes de chegar ao cliente
  const resultado = orcamentoRespostaSchema.safeParse(parsed)
  if (!resultado.success) {
    throw new Error('O formato da resposta da IA está incorreto. Tente novamente.')
  }

  return resultado.data
}