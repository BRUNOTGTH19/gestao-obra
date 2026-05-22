import { FastifyInstance } from 'fastify'
import { z } from 'zod'
import bcrypt from 'bcrypt'

export async function authRoutes(app: FastifyInstance) {
  const registerSchema = z.object({
    email: z.string().email(),
    senha: z.string().min(8)
  })

  app.post('/register', async (request, reply) => {
    const { email, senha } = registerSchema.parse(request.body)
    const senhaHash = await bcrypt.hash(senha, 12)
    
    const usuario = await app.prisma.usuario.create({
      data: { email, senhaHash }
    })
    
    reply.code(201).send({ id: usuario.id, email: usuario.email })
  })

  app.post('/login', async (request, reply) => {
    const { email, senha } = registerSchema.parse(request.body)
    const usuario = await app.prisma.usuario.findUnique({ where: { email } })
    
    if (!usuario || !(await bcrypt.compare(senha, usuario.senhaHash))) {
      return reply.code(401).send({ message: 'Credenciais inválidas' })
    }
    
    const token = app.jwt.sign({ id: usuario.id, email: usuario.email })
    reply.send({ token })
  })
}