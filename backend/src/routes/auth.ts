import { FastifyInstance } from 'fastify'
import { z } from 'zod'
import bcrypt from 'bcrypt'

// ✅ Schema reutilizável para login e registro
const authSchema = z.object({
  email: z.string().email(),
  senha: z.string().min(8)
})

export async function authRoutes(app: FastifyInstance) {
  // ✅ FIX: Rate limit próprio para registro — impede criação massiva de contas
  app.post('/register', {
    config: {
      rateLimit: {
        max: 3,
        timeWindow: '1 hour',
        errorResponseBuilder: () => ({
          statusCode: 429,
          message: 'Muitas tentativas de registro. Tente novamente em 1 hora.'
        })
      }
    }
  }, async (request, reply) => {
    try {
      const { email, senha } = authSchema.parse(request.body)

      // Verifica se e-mail já está em uso
      const existente = await app.prisma.usuario.findUnique({ where: { email } })
      if (existente) {
        return reply.code(409).send({ message: 'E-mail já cadastrado.' })
      }

      const senhaHash = await bcrypt.hash(senha, 12)
      const usuario = await app.prisma.usuario.create({
        data: { email, senhaHash }
      })

      reply.code(201).send({ id: usuario.id, email: usuario.email })
    } catch (err: unknown) {
      if (err instanceof z.ZodError) {
        return reply.code(400).send({ message: 'Dados inválidos.', erros: err.errors })
      }
      app.log.error(err)
      reply.code(500).send({ message: 'Erro interno ao registrar usuário.' })
    }
  })

  app.post('/login', {
    config: {
      rateLimit: {
        max: 10,
        timeWindow: '1 minute',
        errorResponseBuilder: () => ({
          statusCode: 429,
          message: 'Muitas tentativas de login. Aguarde 1 minuto.'
        })
      }
    }
  }, async (request, reply) => {
    try {
      const { email, senha } = authSchema.parse(request.body)
      const usuario = await app.prisma.usuario.findUnique({ where: { email } })

      if (!usuario || !(await bcrypt.compare(senha, usuario.senhaHash))) {
        return reply.code(401).send({ message: 'Credenciais inválidas.' })
      }

      // ✅ FIX: JWT agora expira em 8 horas — token vazado não é eterno
      const token = app.jwt.sign(
        { id: usuario.id, email: usuario.email },
        { expiresIn: '8h' }
      )

      reply.send({ token, email: usuario.email })
    } catch (err: unknown) {
      if (err instanceof z.ZodError) {
        return reply.code(400).send({ message: 'Dados inválidos.', erros: err.errors })
      }
      app.log.error(err)
      reply.code(500).send({ message: 'Erro interno ao realizar login.' })
    }
  })
}