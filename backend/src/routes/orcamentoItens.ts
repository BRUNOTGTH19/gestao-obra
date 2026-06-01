import { FastifyInstance } from 'fastify'
import { z } from 'zod'

// ✅ Tipos explícitos — sem uso de `any`
interface WhereClause {
  usuarioId: string
  dataCompra?: {
    gte?: Date
    lte?: Date
  }
}

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

const paramsSchema = z.object({ id: z.string() })

const querySchema = z.object({
  dataInicio: z.string().optional(),
  dataFim: z.string().optional()
})

export async function orcamentoItemRoutes(app: FastifyInstance) {
  // Listar todos os itens do usuário (com filtro opcional por data)
  app.get('/', async (request, reply) => {
    try {
      const { id: usuarioId } = request.user
      const { dataInicio, dataFim } = querySchema.parse(request.query)

      const where: WhereClause = { usuarioId }
      if (dataInicio || dataFim) {
        where.dataCompra = {}
        if (dataInicio) where.dataCompra.gte = new Date(dataInicio)
        if (dataFim) where.dataCompra.lte = new Date(dataFim)
      }

      return await app.prisma.orcamentoItem.findMany({
        where,
        orderBy: { dataCompra: 'desc' }
      })
    } catch (err: unknown) {
      app.log.error(err)
      reply.code(500).send({ message: 'Erro ao buscar itens de orçamento.' })
    }
  })

  // Criar novo item
  app.post('/', async (request, reply) => {
    try {
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
    } catch (err: unknown) {
      if (err instanceof z.ZodError) {
        return reply.code(400).send({ message: 'Dados inválidos.', erros: err.errors })
      }
      app.log.error(err)
      reply.code(500).send({ message: 'Erro ao criar item de orçamento.' })
    }
  })

  // Atualizar um item existente
  app.put('/:id', async (request, reply) => {
    try {
      const { id: usuarioId } = request.user
      const { id } = paramsSchema.parse(request.params)
      const dados = orcamentoItemUpdateSchema.parse(request.body)

      const item = await app.prisma.orcamentoItem.findUnique({ where: { id } })
      if (!item || item.usuarioId !== usuarioId) {
        return reply.code(404).send({ message: 'Item não encontrado.' })
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
    } catch (err: unknown) {
      if (err instanceof z.ZodError) {
        return reply.code(400).send({ message: 'Dados inválidos.', erros: err.errors })
      }
      app.log.error(err)
      reply.code(500).send({ message: 'Erro ao atualizar item.' })
    }
  })

  // Excluir um item
  app.delete('/:id', async (request, reply) => {
    try {
      const { id: usuarioId } = request.user
      const { id } = paramsSchema.parse(request.params)

      const item = await app.prisma.orcamentoItem.findUnique({ where: { id } })
      if (!item || item.usuarioId !== usuarioId) {
        return reply.code(404).send({ message: 'Item não encontrado.' })
      }

      await app.prisma.orcamentoItem.delete({ where: { id } })
      reply.code(204).send()
    } catch (err: unknown) {
      app.log.error(err)
      reply.code(500).send({ message: 'Erro ao excluir item.' })
    }
  })
}