import { FastifyInstance } from 'fastify'
import { z } from 'zod'
import { gerarOrcamento } from '../services/ia'

export async function orcamentoRoutes(app: FastifyInstance) {
  app.post('/gerar', {
    config: {
      rateLimit: {
        max: 5,
        timeWindow: '1 minute'
      }
    }
  }, async (request, reply) => {
    const schema = z.object({
      insumos: z.array(z.object({
        descricao: z.string(),
        quantidade: z.number(),
        unidade: z.string()
      }))
    })
    
    const { insumos } = schema.parse(request.body)
    const orcamento = await gerarOrcamento(insumos)
    
    reply.send({ orcamento })
  })
}