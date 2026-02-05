# Deployment Guide

## Local
1. `npm install`
2. `copy .env.example .env` and edit if needed
3. `npm run dev`
4. Open `http://localhost:3000`

## Docker
1. `docker build -t isen-ide .`
2. `docker run -p 3000:3000 --env-file .env isen-ide`

## Docker Compose
1. `docker compose up --build`
2. Open `http://localhost:3000`

## MCP
- HTTP: `POST /mcp` when the backend is running
- Stdio server: `npm run mcp`

## Render
- Use `render.yaml` (auto deploy enabled)
- Health check: `/api/health`

## Data
- Workspaces: `workspaces/`
- Uploads: `uploads/`
- State: `data/ide-state.json`
