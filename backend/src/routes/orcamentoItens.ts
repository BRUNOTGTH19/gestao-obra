import { FastifyInstance } from 'fastify'
import { z } from 'zod'

const orcamentoItemSchema = z.object({
  descricao: z.string().min(1, 'Descrição obrigatória'),
  quantidade: z.number().int().min(1),
  valorUnitario: z.number().positive(),
  dataCompra: z.string().regex(/^\d{4}-\d{2}-\d{2}$/)
})

const orcamentoItemUpdateSchema = z.object({
  descricao: z.string().min(1).optional(),
  quantidade: z.number().int().min(1).optional(),
  valorUnitario: z.number().positive().optional(),
  dataCompra: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional()
})

export async function orcamentoItemRoutes(app: FastifyInstance) {
  // Listar todos os itens do usuário (com filtro opcional por data)
  app.get('/', async (request) => {
    const { id: usuarioId } = request.user
    const { dataInicio, dataFim } = request.query as { dataInicio?: string; dataFim?: string }

    const where: any = { usuarioId }
    if (dataInicio || dataFim) {
      where.dataCompra = {}
      if (dataInicio) where.dataCompra.gte = new Date(dataInicio)
      if (dataFim) where.dataCompra.lte = new Date(dataFim)
    }

    return app.prisma.orcamentoItem.findMany({
      where,
      orderBy: { dataCompra: 'desc' }
    })
  })

  // Criar novo item
  app.post('/', async (request, reply) => {
    const { id: usuarioId } = request.user
    const dados = orcamentoItemSchema.parse(request.body)

    const item = await app.prisma.orcamentoItem.create({
      data: {
        descricao: dados.descricao,
        quantidade: dados.quantidade,
        valorUnitario: dados.valorUnitario,
        dataCompra: new Date(dados.dataCompra),
        usuarioId
      }
    })
    reply.code(201).send(item)
  })

  // Atualizar um item existente
  app.put('/:id', async (request, reply) => {
    const { id: usuarioId } = request.user
    const { id } = request.params as { id: string }
    const dados = orcamentoItemUpdateSchema.parse(request.body)

    const item = await app.prisma.orcamentoItem.findUnique({ where: { id } })
    if (!item || item.usuarioId !== usuarioId) {
      return reply.code(404).send({ message: 'Item não encontrado' })
    }

    const updated = await app.prisma.orcamentoItem.update({
      where: { id },
      data: {
        ...(dados.descricao !== undefined && { descricao: dados.descricao }),
        ...(dados.quantidade !== undefined && { quantidade: dados.quantidade }),
        ...(dados.valorUnitario !== undefined && { valorUnitario: dados.valorUnitario }),
        ...(dados.dataCompra !== undefined && { dataCompra: new Date(dados.dataCompra) })
      }
    })
    reply.send(updated)
  })

  // Excluir um item
  app.delete('/:id', async (request, reply) => {
    const { id: usuarioId } = request.user
    const { id } = request.params as { id: string }

    const item = await app.prisma.orcamentoItem.findUnique({ where: { id } })
    if (!item || item.usuarioId !== usuarioId) {
      return reply.code(404).send({ message: 'Item não encontrado' })
    }

    await app.prisma.orcamentoItem.delete({ where: { id } })
    reply.code(204).send()
  })
}