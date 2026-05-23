# ChatNex 🤖

**SaaS de Atendimento com IA para WhatsApp**  
Desenvolvido por [Nodex](https://nodex.com.br) — Agência de Marketing Digital

---

## Stack

- **Frontend**: Next.js 15 + TailwindCSS
- **Backend**: Node.js + Express
- **Banco de dados**: PostgreSQL + Prisma ORM
- **IA**: OpenAI GPT-4o / GPT-4o Mini
- **WhatsApp**: Evolution API
- **Auth**: JWT
- **Realtime**: Socket.IO

---

## Deploy Rápido com Docker

### Pré-requisitos
- Docker e Docker Compose instalados

### 1. Clone o repositório
```bash
git clone https://github.com/seu-usuario/chatnex.git
cd chatnex
```

### 2. Configure variáveis de ambiente

**Backend:**
```bash
cp backend/.env.example backend/.env
# Edite backend/.env com suas configurações
```

**Frontend:**
```bash
cp frontend/.env.example frontend/.env.local
# Edite frontend/.env.local com suas configurações
```

### 3. Suba com Docker Compose
```bash
docker-compose up -d
```

### 4. Acesse
- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:3001

---

## Deploy no Railway

### Backend
1. Crie um novo projeto no Railway
2. Adicione um serviço PostgreSQL
3. Adicione o serviço do backend (pasta /backend)
4. Configure as variáveis:
   - DATABASE_URL
   - JWT_SECRET
   - FRONTEND_URL
   - BACKEND_URL
   - OPENAI_API_KEY
   - EVOLUTION_API_URL
   - EVOLUTION_API_KEY

### Frontend
1. Adicione serviço do frontend (pasta /frontend)
2. Configure:
   - NEXT_PUBLIC_API_URL
   - NEXT_PUBLIC_SOCKET_URL

---

## Desenvolvimento Local

**Backend:**
```bash
cd backend && npm install
npx prisma migrate dev
npx prisma db seed
npm run dev
```

**Frontend:**
```bash
cd frontend && npm install
npm run dev
```

---

## Credenciais padrão (seed)

```
Email: admin@nodex.com.br
Senha: Admin@123
```

---

## Funcionalidades

- Login e cadastro multi-empresa
- Dashboard com métricas
- Conexão WhatsApp via QR Code
- IA com OpenAI GPT-4o
- Chat ao vivo
- Configuração completa da IA
- Webhook Evolution API
- WebSocket em tempo real
- Design dark premium (paleta Nodex)
- Landing page profissional

---

Desenvolvido por **Nodex** — Agência de Marketing Digital
