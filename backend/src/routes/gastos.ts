import { FastifyInstance } from 'fastify'
import { z } from 'zod'

// ✅ Tipos explícitos — sem uso de `any`
interface WhereClause {
  usuarioId: string
  categoria?: string
  dataGasto?: {
    gte?: Date
    lte?: Date
  }
}

const gastoSchema = z.object({
  categoria: z.enum(['ALIMENTACAO', 'TRANSPORTE', 'MATERIAL']),
  valor: z.number().positive(),
  descricao: z.string().optional(),
  dataGasto: z.string().regex(/^\d{4}-\d{2}-\d{2}$/)
})

const querySchema = z.object({
  categoria: z.string().optional(),
  dataInicio: z.string().optional(),
  dataFim: z.string().optional()
})

const paramsSchema = z.object({ id: z.string() })

export async function gastoRoutes(app: FastifyInstance) {
  // Listar gastos com filtros opcionais
  app.get('/', async (request, reply) => {
    try {
      const { id: usuarioId } = request.user
      const { categoria, dataInicio, dataFim } = querySchema.parse(request.query)

      const where: WhereClause = { usuarioId }
      if (categoria) where.categoria = categoria

      if (dataInicio || dataFim) {
        where.dataGasto = {}
        if (dataInicio) where.dataGasto.gte = new Date(dataInicio)
        if (dataFim) where.dataGasto.lte = new Date(dataFim)
      }

      return await app.prisma.gasto.findMany({
        where,
        orderBy: { dataGasto: 'desc' }
      })
    } catch (err: unknown) {
      app.log.error(err)
      reply.code(500).send({ message: 'Erro ao buscar gastos.' })
    }
  })

  // Registrar novo gasto
  app.post('/', async (request, reply) => {
    try {
      const { id: usuarioId } = request.user
      const dados = gastoSchema.parse(request.body)

      const gasto = await app.prisma.gasto.create({
        data: {
          categoria: dados.categoria,
          valor: dados.valor,
          descricao: dados.descricao,
          dataGasto: new Date(dados.dataGasto),
          usuarioId
        }
      })

      reply.code(201).send(gasto)
    } catch (err: unknown) {
      if (err instanceof z.ZodError) {
        return reply.code(400).send({ message: 'Dados inválidos.', erros: err.errors })
      }
      app.log.error(err)
      reply.code(500).send({ message: 'Erro ao registrar gasto.' })
    }
  })

  // Remover gasto (apenas se pertencer ao usuário)
  app.delete('/:id', async (request, reply) => {
    try {
      const { id: usuarioId } = request.user
      const { id } = paramsSchema.parse(request.params)

      const gasto = await app.prisma.gasto.findUnique({ where: { id } })
      if (!gasto || gasto.usuarioId !== usuarioId) {
        return reply.code(404).send({ message: 'Gasto não encontrado.' })
      }

      await app.prisma.gasto.delete({ where: { id } })
      reply.code(204).send()
    } catch (err: unknown) {
      app.log.error(err)
      reply.code(500).send({ message: 'Erro ao remover gasto.' })
    }
  })
}