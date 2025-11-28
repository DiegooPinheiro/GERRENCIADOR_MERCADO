<!-- .github/copilot-instructions.md: Guidance for AI coding agents working on GERRENCIADOR_MERCADO -->
# Copilot / AI agent instructions — GERRENCIADOR_MERCADO

Resumo rápido
- Projeto full-stack minimal: Docker compose with 3 services (Postgres DB, Django REST backend, React + Vite frontend).
- Backend: mercado_backend (Django + Django REST Framework). API root mounts at `/api/` and the Produtos app exposes `/api/produtos/`.
- Frontend: mercado_frontend (React + TypeScript + Vite) uses axios to call `/api/produtos/`.

Arquitetura & pontos chaves (onde olhar)
- docker-compose.yml — orquestra os contêineres: db (postgres), backend (Django) e frontend (Vite). Useful for local end-to-end runs.
- mercado_backend/mercado_api/settings.py — principais variáveis, CORS e REST_FRAMEWORK (JSON-only renderer; no browsable API).
- mercado_backend/produtos/
  - models.py — Produto model (nome, preco, estoque)
  - serializers.py — ProdutoSerializer (fields: id, nome, preco, estoque, created_at, updated_at)
  - views.py — ProdutoViewSet (ModelViewSet, default queryset order -id)
  - urls.py — router.register('produtos', ProdutoViewSet)
- mercado_frontend/src/App.tsx — example usage of the API via axios and the UI behavior.

Dev workflow & commands
- Run full stack with Docker Compose (recommended for dev parity):
  - docker-compose up --build
  - db is accessible inside container as `db`, host exposed at localhost:5432
- Backend (manual / fast iteration):
  - cd mercado_backend
  - activate your venv (repo sometimes has a venv in local dev setups)
  - python manage.py migrate
  - python manage.py runserver 0.0.0.0:8000
- Frontend (manual):
  - cd mercado_frontend
  - npm install
  - npm run dev

Key implementation patterns the agent should follow
- For simple resources (like Produtos) follow the model → serializer → viewset → router pattern already present.
  Example path: add model -> add serializer in `produtos/serializers.py` -> add viewset in `produtos/views.py` -> register route in `produtos/urls.py`.
- API shape: endpoints under `/api/produtos/` return JSON arrays or objects matching the ProductSerializer fields.
- Keep locale/code comments in Portuguese (project uses pt‑BR strings and time zone). Keep messages and UI labels consistent with that convention.

Testing & expectations
- There are no tests currently implemented (see `produtos/tests.py` placeholder). If adding tests prefer Django `TestCase` in backend and normal React testing for frontend.

SQLTools / VS Code quick setup
- This workspace includes recommended extensions and a pre-configured SQLTools connection under `.vscode/settings.json` named `mercado-local` (localhost:5432, mercado_db, user: postgres, password: root). Use the SQLTools GUI to browse tables, run queries and edit rows.
- Tasks: `.vscode/tasks.json` provides two quick tasks:
  - **Open psql (docker)** — opens an interactive psql shell in the `mercado_postgres` container
  - **SQL Tools: smoke test — count produtos** — runs a quick COUNT query to validate DB connectivity


Notes for making safe changes
- The backend settings include `CORS_ALLOW_ALL_ORIGINS = True` (development convenience). Don’t assume production-ready security is present.
- The repo uses environment variables via a `.env` loaded from `mercado_backend/` — use `.env` for safe local testing and avoid committing secrets.

Troubleshooting: Postgres connection differences (local vs Docker)
- When running with docker-compose the backend service gets environment variables from `docker-compose.yml` (DB_HOST=db), and inside the compose network the Postgres hostname is `db`.
- If you run the Django backend locally (outside Docker) and rely on `mercado_backend/.env`, `DB_HOST=localhost` will attempt to connect to a Postgres instance on the host. Make sure:
  - a Postgres instance is running on the host (localhost:5432) OR
  - change `DB_HOST` to `host.docker.internal` on some platforms if you need to reach a containerized DB from host processes.
- Common symptom: backend can run but writes are not persisted because it’s connecting to the wrong DB instance or migrations were not applied. Fixes:
  - For Docker: run `docker-compose exec backend python manage.py migrate` and confirm logs.
  - For local backend: confirm `DB_HOST` in `.env`, start Postgres locally, and run `python manage.py migrate`.

Quick examples an AI agent can use when editing code
- Add a new field to Produto:
  1) models.py: add field
  2) run `python manage.py makemigrations` and `python manage.py migrate`
  3) update serializers to expose the field
  4) update frontend API usage in `src/App.tsx` to read/write the new property

When in doubt
- Check the files mentioned above and run the stack locally using `docker-compose up --build` for quick integration verification. Use `docker-compose logs -f` to follow logs and `docker exec -it mercado_postgres psql -U postgres -d mercado_db -c "SELECT version();"` for DB checks.

- Front-end dev proxy & VITE_API_URL
- The frontend dev server proxies /api to `process.env.VITE_API_URL || 'http://backend:8000/api'` as defined in `vite.config.ts`.
- When running frontend locally, set `VITE_API_URL` to your backend host (example for Windows PowerShell):
  - `$env:VITE_API_URL = 'http://localhost:8000/api'` then `npm run dev`
- The app also reads from `API_BASE_URL` — `App.tsx` uses `VITE_API_URL` only when it points to a browser-reachable host (eg. `localhost`). Otherwise it uses the relative `/api` path so the dev server proxy handles traffic.
 - `App.tsx` respects `VITE_API_URL` when present and falls back to the `/api` proxy path. If you change `App.tsx` update docs accordingly.

If you changed behaviour that affects API shape, update `App.tsx` and `produtos/serializers.py` together to keep frontend and backend compatible.

---
If any of the above areas are unclear or you want more detail on a specific workflow (tests, CI, or local debugging) say which part and I’ll expand this file.