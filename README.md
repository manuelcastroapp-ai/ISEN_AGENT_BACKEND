# ISEN Agent IDE (Penguin Alpha Enhanced)

IDE moderno con agentes IA, marketplace, MCP y backend unificado.

## Caracteristicas
- Workspaces con editor Monaco y terminal
- Agentes, herramientas, protocolos e integraciones
- Marketplace con licencias y planes
- MCP (HTTP + stdio)
- Estado persistente y auditoria

## Quick start
1. `npm install`
2. `copy .env.example .env`
3. `npm run dev`
4. Abrir `http://localhost:3000`

## MCP
- HTTP: `POST /mcp`
- Stdio: `npm run mcp`

## Deploy
- Render: usar `render.yaml`
- Netlify (frontend): `netlify.toml`
- Docker: `docker build -t isen-ide .`
- Docker Compose: `docker compose up --build`

## Rutas clave
- `frontend/` UI
- `server.js` backend
- `agents/`, `tools/`, `protocols/`, `integrations/`
- `services/` registry, state, MCP
- `data/ide-state.json` estado persistente

## Variables de entorno
Ver `.env.example` para LLM local o OpenAI.
