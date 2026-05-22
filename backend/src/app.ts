import 'dotenv/config'
import Fastify from 'fastify'
import cors from '@fastify/cors'
import jwt from '@fastify/jwt'
import rateLimit from '@fastify/rate-limit'
import helmet from '@fastify/helmet'
import { PrismaClient } from '@prisma/client'
import { authRoutes } from './routes/auth'
import { funcionarioRoutes } from './routes/funcionarios'
import { gastoRoutes } from './routes/gastos'
import { orcamentoRoutes } from './routes/orcamentos'
import { orcamentoItemRoutes } from './routes/orcamentoItens'

const prisma = new PrismaClient()

const app = Fastify({ logger: true })

// Segurança – Helmet
app.register(helmet, {
  contentSecurityPolicy: false, // CSP gerenciado pelo frontend
  crossOriginResourcePolicy: { policy: "cross-origin" }
})

// CORS – restrito à origem de produção (via variável de ambiente) ou aberto em dev
app.register(cors, {
  origin: process.env.CORS_ORIGIN || true
})

// Autenticação JWT
app.register(jwt, { secret: process.env.JWT_SECRET! })

// Rate limiting global
app.register(rateLimit, { max: 100, timeWindow: '1 minute' })

// Disponibiliza o Prisma em todas as rotas
app.decorate('prisma', prisma)

declare module 'fastify' {
  interface FastifyInstance {
    prisma: PrismaClient
  }
}

// Rotas públicas (sem autenticação)
app.register(authRoutes, { prefix: '/api/v1/auth' })

// Middleware de autenticação – todas as rotas abaixo exigem JWT
app.addHook('onRequest', async (request, reply) => {
  if (request.url.startsWith('/api/v1/auth')) return
  try {
    await request.jwtVerify()
  } catch (err) {
    reply.code(401).send({ message: 'Unauthorized' })
  }
})

// Rotas protegidas
app.register(funcionarioRoutes, { prefix: '/api/v1/funcionarios' })
app.register(gastoRoutes, { prefix: '/api/v1/gastos' })
app.register(orcamentoItemRoutes, { prefix: '/api/v1/orcamento-itens' })
app.register(orcamentoRoutes, { prefix: '/api/v1/orcamentos' })

const start = async () => {
  try {
    await app.listen({ port: 3001, host: '0.0.0.0' })
    console.log('Server running on http://localhost:3001')
  } catch (err) {
    app.log.error(err)
    process.exit(1)
  }
}

start()