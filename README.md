# Sistema OS — Gestão de Ordens de Serviço

MVP para gestão de ordens de serviço de assistência técnica de eletrodomésticos
(máquinas de lavar, geladeiras, secadoras e lava-louças).

## Stack

| Camada | Tecnologia |
|--------|-----------|
| Backend | Java 21 · Spring Boot 3.3 · Flyway · PostgreSQL 16 |
| Frontend | React 18 · TypeScript · Vite · TailwindCSS · TanStack Query |
| Auth | JWT — perfis `ADMIN` e `TECNICO` |
| Mapas | Google Maps JavaScript API (Sprint 4) |

## Pré-requisitos

- Docker 24+ e Docker Compose v2
- Java 21 + Maven 3.9+ (para rodar o backend localmente)
- Node.js 20+ (para rodar o frontend localmente)

---

## Sprint 0 — Como rodar

O banco de dados roda na nuvem (Supabase, Neon, Railway etc.).
Você precisa fornecer as credenciais no arquivo `.env`.

### 1. Configure as variáveis de ambiente

```bash
cp .env.example .env
# Edite .env com as credenciais do seu banco cloud
```

Exemplo de `.env` para **Supabase / Neon**:
```env
DB_URL=jdbc:postgresql://<host>:5432/<database>?sslmode=require
DB_USER=<usuario>
DB_PASSWORD=<senha>
```

### Opção A: Backend via Docker Compose

```bash
# Sobe apenas o backend (banco já está na nuvem)
docker compose up -d

# Frontend
cd frontend && npm install && npm run dev
```

### Opção B: Backend local (recomendada para desenvolvimento)

```bash
# Terminal 1 — backend
cd backend
export $(grep -v '^#' ../.env | xargs)
mvn spring-boot:run

# Terminal 2 — frontend
cd frontend
npm install && npm run dev
```

| Serviço | URL |
|---------|-----|
| Frontend | http://localhost:5173 |
| Backend API | http://localhost:8080 |

---

## Credenciais iniciais

| Campo | Valor |
|-------|-------|
| E-mail | `admin@sistemaos.com` |
| Senha | `admin123` |
| Perfil | `ADMIN` |

> O usuário admin é criado automaticamente na primeira inicialização
> (via `DataInitializer`). Troque a senha após o primeiro login.

---

## Endpoints disponíveis no Sprint 0

```
POST /api/auth/login   → { token, id, nome, role }
GET  /api/auth/me      → { id, nome, email, role, telefone }  [JWT obrigatório]
```

---

## Roadmap de Sprints

- [x] **Sprint 0** — Setup, Docker, migrations, autenticação JWT, seed Admin
- [ ] **Sprint 1** — CRUD de clientes e equipamentos
- [ ] **Sprint 2** — Ordens de Serviço, máquina de estados, histórico
- [ ] **Sprint 3** — Dashboard Admin, gestão de usuários
- [ ] **Sprint 4** — Dashboard Técnico, Google Maps, deep links de rota
- [ ] **Sprint 5** — Responsividade mobile, tratamento de erros, deploy
# SistemaOs-Sanstec
