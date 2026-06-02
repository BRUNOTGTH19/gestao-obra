import { FastifyInstance } from 'fastify'
import { z } from 'zod'

const gastoSchema = z.object({
  categoria: z.enum(['ALIMENTACAO', 'TRANSPORTE', 'MATERIAL']),
  valor: z.number().positive(),
  descricao: z.string().optional(),
  dataGasto: z.string().regex(/^\d{4}-\d{2}-\d{2}$/)
})

const gastoUpdateSchema = z.object({
  categoria: z.enum(['ALIMENTACAO', 'TRANSPORTE', 'MATERIAL']).optional(),
  valor: z.number().positive().optional(),
  descricao: z.string().optional(),
  dataGasto: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional()
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

  // Atualizar um gasto existente
  app.put('/:id', async (request, reply) => {
    const { id: usuarioId } = request.user
    const { id } = request.params as { id: string }
    const dados = gastoUpdateSchema.parse(request.body)

    const gasto = await app.prisma.gasto.findUnique({ where: { id } })
    if (!gasto || gasto.usuarioId !== usuarioId) {
      return reply.code(404).send({ message: 'Gasto não encontrado' })
    }

    const updated = await app.prisma.gasto.update({
      where: { id },
      data: {
        ...(dados.categoria !== undefined && { categoria: dados.categoria }),
        ...(dados.valor !== undefined && { valor: dados.valor }),
        ...(dados.descricao !== undefined && { descricao: dados.descricao }),
        ...(dados.dataGasto !== undefined && { dataGasto: new Date(dados.dataGasto) })
      }
    })
    reply.send(updated)
  })

  // Remover gasto
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