import { FastifyInstance } from 'fastify'
import { z } from 'zod'
import { gerarOrcamento } from '../services/ia'

export async function orcamentoRoutes(app: FastifyInstance) {
  app.post('/gerar', {
    config: {
      rateLimit: {
        max: 5,
        timeWindow: '1 minute',
        errorResponseBuilder: () => ({
          statusCode: 429,
          message: 'Limite de orçamentos atingido. Aguarde 1 minuto.'
        })
      }
    }
  }, async (request, reply) => {
    try {
      const schema = z.object({
        insumos: z.array(z.object({
          descricao: z.string(),
          quantidade: z.number(),
          unidade: z.string()
        })).min(1, 'Informe ao menos um insumo.')
      })

      const { insumos } = schema.parse(request.body)
      const orcamento = await gerarOrcamento(insumos)

      reply.send({ orcamento })
    } catch (err: unknown) {
      if (err instanceof z.ZodError) {
        return reply.code(400).send({ message: 'Dados inválidos.', erros: err.errors })
      }
      // Erros da IA (JSON inválido, formato inesperado, etc.)
      if (err instanceof Error) {
        return reply.code(502).send({ message: err.message })
      }
      app.log.error(err)
      reply.code(500).send({ message: 'Erro ao gerar orçamento.' })
    }
  })
}