import { FastifyInstance } from 'fastify'
import { z } from 'zod'

const funcionarioSchema = z.object({
  nome: z.string().min(3),
  telefone: z.string(),
  profissao: z.string(),
  valorDiaria: z.number().positive(),
  diasTrabalhados: z.number().int().min(0).default(0),
  datasTrabalhadas: z.array(z.string()).optional().default([]),
  tipoContrato: z.enum(['CLT', 'PJ', 'TEMPORARIO'])
})

const funcionarioUpdateSchema = z.object({
  diasTrabalhados: z.number().int().min(0).optional(),
  datasTrabalhadas: z.array(z.string()).optional()
})

export async function funcionarioRoutes(app: FastifyInstance) {
  // Listar funcionários com busca opcional por nome
  app.get('/', async (request) => {
    const { id: usuarioId } = request.user
    const { nome } = request.query as { nome?: string }

    const where: any = { usuarioId }
    if (nome) where.nome = { contains: nome }

    const funcionarios = await app.prisma.funcionario.findMany({
      where,
      orderBy: { createdAt: 'desc' }
    })

    // Converte datasTrabalhadas de string JSON para array
    return funcionarios.map(f => ({
      ...f,
      datasTrabalhadas: f.datasTrabalhadas ? JSON.parse(f.datasTrabalhadas) : []
    }))
  })

  // Cadastrar novo funcionário
  app.post('/', async (request, reply) => {
    const { id: usuarioId } = request.user
    const dados = funcionarioSchema.parse(request.body)

    // Converte o array de datas para string JSON
    const datasJson = dados.datasTrabalhadas && dados.datasTrabalhadas.length > 0
      ? JSON.stringify(dados.datasTrabalhadas)
      : null

    const funcionario = await app.prisma.funcionario.create({
      data: {
        nome: dados.nome,
        telefone: dados.telefone,
        profissao: dados.profissao,
        valorDiaria: dados.valorDiaria,
        diasTrabalhados: dados.diasTrabalhados,
        datasTrabalhadas: datasJson,
        tipoContrato: dados.tipoContrato,
        usuarioId
      }
    })
    reply.code(201).send({
      ...funcionario,
      datasTrabalhadas: funcionario.datasTrabalhadas ? JSON.parse(funcionario.datasTrabalhadas) : []
    })
  })

  // Atualizar dias trabalhados e datas
  app.put('/:id', async (request, reply) => {
    const { id: usuarioId } = request.user
    const { id } = request.params as { id: string }
    const dados = funcionarioUpdateSchema.parse(request.body)

    // Verifica se o funcionário pertence ao usuário
    const funcionario = await app.prisma.funcionario.findUnique({ where: { id } })
    if (!funcionario || funcionario.usuarioId !== usuarioId) {
      return reply.code(404).send({ message: 'Funcionário não encontrado' })
    }

    const updateData: any = {}
    if (dados.diasTrabalhados !== undefined) {
      updateData.diasTrabalhados = dados.diasTrabalhados
    }
    if (dados.datasTrabalhadas !== undefined) {
      updateData.datasTrabalhadas = dados.datasTrabalhadas.length > 0
        ? JSON.stringify(dados.datasTrabalhadas)
        : null
    }

    const atualizado = await app.prisma.funcionario.update({
      where: { id },
      data: updateData
    })

    reply.send({
      ...atualizado,
      datasTrabalhadas: atualizado.datasTrabalhadas ? JSON.parse(atualizado.datasTrabalhadas) : []
    })
  })

  // Remover funcionário
  app.delete('/:id', async (request, reply) => {
    const { id: usuarioId } = request.user
    const { id } = request.params as { id: string }

    const funcionario = await app.prisma.funcionario.findUnique({ where: { id } })
    if (!funcionario || funcionario.usuarioId !== usuarioId) {
      return reply.code(404).send({ message: 'Funcionário não encontrado' })
    }

    await app.prisma.funcionario.delete({ where: { id } })
    reply.code(204).send()
  })
}