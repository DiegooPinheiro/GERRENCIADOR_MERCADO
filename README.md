# Gerenciador de Mercado — visão rápida

Projeto full-stack minimal (dev):
- Postgres (container)
- Backend Django + Django REST Framework (container)
- Frontend React + TypeScript + Vite (container / dev)

Use este README para levantar o ambiente localmente, depurar problemas de conexão com o DB e usar o SQLTools no VS Code.

## Levantar a stack (recomendado)
Roda tudo via Docker Compose (dev):

PowerShell
```
docker-compose up --build -d
```

Acesse:
- Frontend: http://localhost:5173
- Backend API: http://localhost:8000/api/

Aplicar migrations (se pedir):

```
docker-compose exec backend python manage.py migrate
```

## Rodar backend localmente (fora do Docker)
1. Entre na pasta `mercado_backend` e ative seu venv.
2. Verifique `mercado_backend/.env` — `DB_HOST` deve apontar para a instância Postgres que você quer (por ex. `localhost` se estiver usando o DB do container com porta mapeada).

Comandos:

PowerShell
```
cd mercado_backend
# ative o venv
python manage.py migrate
python manage.py runserver 0.0.0.0:8000
```

Se o backend rodando local não conseguir conectar, confirme que o Postgres está acessível em `localhost:5432`.

## Rodar frontend localmente
O frontend usa `VITE_API_URL` para apontar para o backend em dev. Se você rodar frontend localmente e o backend estiver em localhost:

PowerShell
```
$env:VITE_API_URL = 'http://localhost:8000/api'
npm run dev
```

Caso o frontend seja executado em container pelo compose, `VITE_API_URL` já é configurado para apontar para o hostname interno `http://backend:8000/api`.

## Acessando o banco no VS Code (SQLTools)
Recomendamos usar SQLTools para navegar no Postgres:

1. Instale as extensões (recomendadas) — `mtxr.sqltools` e `mtxr.sqltools-driver-pg`.
2. Há uma conexão pronta em `.vscode/settings.json` chamada `mercado-local` (host: `localhost`, port: `5432`, database: `mercado_db`, user: `postgres`, password: `root`).
3. Use também as tasks do VS Code:
   - `Open psql (docker)` — abre um shell psql no container `mercado_postgres`.
   - `SQL Tools: smoke test — count produtos` — executa um `SELECT COUNT(*)` rápido em `produtos_produto`.

## Troubleshooting rápido
- Se o frontend mostrar ECONNREFUSED ao proxy (`/api`): verifique se o dev server do Vite está configurado para `VITE_API_URL` correto (localhost quando roda no host, `backend` quando dentro do compose).
- Se as alterações não aparecerem ou você tiver erros 500/404: veja os logs em tempo real com:

PowerShell
```
docker-compose logs -f backend frontend
```

---
Se quiser, eu adiciono um `README` com passos para CI / testes ou um script automatizado de smoke tests. Quer que eu inclua isso agora?
