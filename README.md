# ChatNex 🤖

**SaaS de Atendimento com IA para WhatsApp**  
Desenvolvido por [Nodex](https://nodex.com.br) — Agência de Marketing Digital

---

## Deploy no Railway (passo a passo)

### Por que Railway?

GitHub Pages só serve HTML estático — não suporta Next.js com SSR, Node.js, banco de dados ou WebSockets. O Railway suporta tudo isso.

---

### Passo 1 — Crie uma conta no Railway

Acesse [railway.app](https://railway.app) e faça login com GitHub.

---

### Passo 2 — Crie um novo projeto

1. Clique em **New Project**
2. Selecione **Empty Project**

---

### Passo 3 — Adicione o banco PostgreSQL

1. No projeto criado, clique em **+ New**
2. Selecione **Database → PostgreSQL**
3. Aguarde o banco subir
4. Clique no banco → aba **Connect** → copie a `DATABASE_URL`

---

### Passo 4 — Deploy do Backend

1. No projeto, clique em **+ New → GitHub Repo**
2. Selecione o repositório `chatnex`
3. Quando perguntar qual pasta, escolha `/backend` (ou configure o **Root Directory** como `backend`)
4. Vá em **Variables** e adicione:

```
DATABASE_URL=<cole a URL do PostgreSQL copiada no passo 3>
JWT_SECRET=uma-chave-secreta-forte-aqui-123
JWT_EXPIRES_IN=7d
NODE_ENV=production
PORT=3001
FRONTEND_URL=https://SEU-FRONTEND.up.railway.app
BACKEND_URL=https://SEU-BACKEND.up.railway.app
OPENAI_API_KEY=sk-...
EVOLUTION_API_URL=https://sua-evolution-api.com
EVOLUTION_API_KEY=sua-chave-evolution
```

5. Clique em **Deploy**
6. Após subir, vá em **Settings → Networking → Generate Domain**
7. Copie a URL do backend (ex: `https://chatnex-backend.up.railway.app`)

---

### Passo 5 — Deploy do Frontend

1. No mesmo projeto, clique em **+ New → GitHub Repo** novamente
2. Selecione o mesmo repositório, mas configure **Root Directory** como `frontend`
3. Vá em **Variables** e adicione:

```
NEXT_PUBLIC_API_URL=https://SEU-BACKEND.up.railway.app/api
NEXT_PUBLIC_SOCKET_URL=https://SEU-BACKEND.up.railway.app
```

4. Clique em **Deploy**
5. Após subir, gere o domínio em **Settings → Networking → Generate Domain**

---

### Passo 6 — Atualize as URLs

Volte no serviço do **backend** e atualize:
```
FRONTEND_URL=https://SEU-FRONTEND.up.railway.app
BACKEND_URL=https://SEU-BACKEND.up.railway.app
```

Clique em **Redeploy**.

---

### Passo 7 — Acesse o sistema

Abra a URL do frontend no navegador. Crie sua conta e comece a usar!

---

## Desenvolvimento Local

**Backend:**
```bash
cd backend
cp .env.example .env
# edite o .env com suas configurações
npm install
npx prisma migrate dev
npx prisma db seed
npm run dev
# roda em http://localhost:3001
```

**Frontend:**
```bash
cd frontend
cp .env.example .env.local
# edite o .env.local
npm install
npm run dev
# roda em http://localhost:3000
```

---

## Docker local (alternativa)

```bash
# na raiz do projeto:
docker-compose up -d
```

Acesse em `http://localhost:3000`

---

## Credenciais demo (seed)

```
Email: admin@nodex.com.br
Senha: Admin@123
```

---

## Stack

- **Frontend**: Next.js 15 + TailwindCSS
- **Backend**: Node.js + Express
- **Banco**: PostgreSQL + Prisma ORM
- **IA**: OpenAI GPT-4o / GPT-4o Mini
- **WhatsApp**: Evolution API
- **Auth**: JWT
- **Realtime**: Socket.IO
- **Deploy**: Railway

---

## Funcionalidades

- Login e cadastro multi-empresa
- Dashboard com métricas em tempo real
- Conexão WhatsApp via QR Code
- IA automática com OpenAI GPT-4o
- Chat ao vivo estilo WhatsApp
- Configuração completa da IA (prompt, FAQ, produtos, regras)
- Webhook Evolution API
- WebSocket para mensagens em tempo real
- Design dark premium (paleta Nodex)
- Landing page profissional

---

Desenvolvido por **Nodex** — Agência de Marketing Digital
