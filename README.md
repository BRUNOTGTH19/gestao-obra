# 🏗️ Gestão Obra

Sistema de gestão de obras para construção civil. Controle de funcionários, gastos, orçamentos manuais e geração de orçamentos com inteligência artificial (Google Gemini).

![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)
![Status: Em Produção](https://img.shields.io/badge/Status-Em%20Produção-brightgreen)

🌐 **Acesse o sistema em produção:** [https://gestao-obra-theta.vercel.app](https://gestao-obra-theta.vercel.app)

## ✨ Funcionalidades

- ✅ Cadastro e gerenciamento de funcionários (diárias, datas trabalhadas)
- ✅ Controle de gastos por categoria (alimentação, transporte, material)
- ✅ Orçamentos manuais com cálculo automático de totais
- ✅ Geração de orçamentos por IA (Google Gemini)
- ✅ Filtros por data, categoria e nome
- ✅ Exportação de relatórios em PDF
- ✅ Autenticação JWT com isolamento de dados por usuário
- ✅ PWA (pode ser instalado no celular/desktop)
- ✅ Deploy automático via GitHub (Render + Vercel)

## 🚀 Tecnologias

| Camada       | Tecnologias                                      |
|--------------|--------------------------------------------------|
| **Backend**  | Node.js, Fastify, TypeScript, Prisma ORM, MySQL  |
| **Frontend** | React 19, Vite, TypeScript, Tailwind CSS, PWA    |
| **IA**       | Google Gemini (gratuito)                         |
| **Hospedagem**| Render (API) + Vercel (Frontend) + Railway (Banco)|

## 📦 Pré-requisitos

- Node.js 18+
- MySQL 8+ (local) ou Docker
- Conta no Google AI Studio (para funcionalidade de IA)

## ⚙️ Variáveis de Ambiente

### Backend (`backend/.env`)
Crie um arquivo `.env` na pasta `backend` com base no exemplo abaixo:

```env
# Banco de dados MySQL
DATABASE_URL=mysql://usuario:senha@localhost:3306/gestao_obra

# Chave secreta para JWT (substitua por uma string forte)
JWT_SECRET=seu_segredo_super_seguro

# Chave da API Google Gemini para IA (opcional - obtenha em https://aistudio.google.com/apikey)
GEMINI_API_KEY=sua_chave_gemini

# Origem permitida para CORS (em produção, use a URL do frontend)
CORS_ORIGIN=http://localhost:5173
