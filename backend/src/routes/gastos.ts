import { FastifyInstance } from 'fastify'
import { z } from 'zod'

const gastoSchema = z.object({
  categoria: z.enum(['ALIMENTACAO', 'TRANSPORTE', 'MATERIAL']),
  valor: z.number().positive(),
  descricao: z.string().optional(),
  dataGasto: z.string().regex(/^\d{4}-\d{2}-\d{2}$/)
})

export async function gastoRoutes(app: FastifyInstance) {
  // Listar gastos com filtros opcionais
  app.get('/', async (request) => {
    const { id: usuarioId } = request.user
    const { categoria, dataInicio, dataFim } = request.query as {
      categoria?: string
      dataInicio?: string
      dataFim?: string
    }

    const where: any = { usuarioId }
    if (categoria) where.categoria = categoria

    // Filtro por intervalo de datas
    if (dataInicio || dataFim) {
      where.dataGasto = {}
      if (dataInicio) where.dataGasto.gte = new Date(dataInicio)
      if (dataFim) where.dataGasto.lte = new Date(dataFim)
    }

    return app.prisma.gasto.findMany({
      where,
      orderBy: { dataGasto: 'desc' }
    })
  })

  // Registrar novo gasto
  app.post('/', async (request, reply) => {
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
  })

  // Remover gasto (apenas se pertencer ao usuário)
  app.delete('/:id', async (request, reply) => {
    const { id: usuarioId } = request.user
    const { id } = request.params as { id: string }

    const gasto = await app.prisma.gasto.findUnique({ where: { id } })
    if (!gasto || gasto.usuarioId !== usuarioId) {
      return reply.code(404).send({ message: 'Gasto não encontrado' })
    }

    await app.prisma.gasto.delete({ where: { id } })
    reply.code(204).send()
  })
}