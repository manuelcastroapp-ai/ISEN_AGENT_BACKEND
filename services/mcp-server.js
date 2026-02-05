const path = require('path');
const fs = require('fs/promises');
const { McpServer, ResourceTemplate } = require('@modelcontextprotocol/sdk/server/mcp');
const z = require('zod');

function sanitizeRelativePath(filePath) {
  const value = String(filePath || '').replace(/\\/g, '/');
  if (!value || value.includes('..')) {
    throw new Error('Ruta invalida');
  }
  return value.replace(/^\/+/, '');
}

function toTextResult(data) {
  const text = typeof data === 'string' ? data : JSON.stringify(data, null, 2);
  return { content: [{ type: 'text', text }] };
}

function toResourceContents(uri, data, mimeType = 'application/json') {
  const text = typeof data === 'string' ? data : JSON.stringify(data, null, 2);
  return {
    contents: [
      {
        uri,
        mimeType,
        text
      }
    ]
  };
}

function createMcpServer({ registry, state, rootDir }) {
  const server = new McpServer({
    name: 'isen-ide-mcp',
    version: '1.0.0',
    websiteUrl: 'https://isen.local'
  });

  server.registerTool('agent.run', {
    title: 'Run IDE Agent',
    description: 'Ejecuta un agente especializado',
    inputSchema: {
      id: z.string().describe('Agent ID'),
      action: z.string().optional().describe('Action ID'),
      payload: z.unknown().optional().describe('Input payload')
    }
  }, async ({ id, action, payload }) => {
    const result = await registry.runAgent(id, { action, ...(payload || {}) });
    return toTextResult(result);
  });

  server.registerTool('tool.run', {
    title: 'Run IDE Tool',
    description: 'Ejecuta una herramienta del IDE',
    inputSchema: {
      id: z.string().describe('Tool ID'),
      action: z.string().optional().describe('Action ID'),
      payload: z.unknown().optional().describe('Input payload')
    }
  }, async ({ id, action, payload }) => {
    const result = await registry.runTool(id, { action, ...(payload || {}) });
    return toTextResult(result);
  });

  server.registerTool('protocol.run', {
    title: 'Run IDE Protocol',
    description: 'Ejecuta un protocolo operacional',
    inputSchema: {
      id: z.string().describe('Protocol ID'),
      action: z.string().optional().describe('Action ID'),
      payload: z.unknown().optional().describe('Input payload')
    }
  }, async ({ id, action, payload }) => {
    const result = await registry.runProtocol(id, { action, ...(payload || {}) });
    return toTextResult(result);
  });

  server.registerTool('selfdev.scan', {
    title: 'Self Dev Scan',
    description: 'Escanea proyectos y genera insights',
    inputSchema: {
      roots: z.array(z.string()).optional().describe('Roots to scan'),
      maxDepth: z.number().optional().describe('Max depth'),
      maxResults: z.number().optional().describe('Max results')
    }
  }, async ({ roots, maxDepth, maxResults }) => {
    const result = await registry.runAgent('self-dev-agent', {
      action: 'scan',
      roots,
      maxDepth,
      maxResults
    });
    return toTextResult(result);
  });

  server.registerResource('workspaces', 'ide://workspaces', {
    title: 'Workspaces',
    description: 'Lista de workspaces',
    mimeType: 'application/json'
  }, async () => {
    const data = Object.values(state.workspaces || {});
    return toResourceContents('ide://workspaces', data);
  });

  server.registerResource('projects', 'ide://projects', {
    title: 'Projects',
    description: 'Lista de proyectos',
    mimeType: 'application/json'
  }, async () => {
    const data = Object.values(state.projects || {});
    return toResourceContents('ide://projects', data);
  });

  server.registerResource('marketplace', 'ide://marketplace', {
    title: 'Marketplace',
    description: 'Catalogo de marketplace',
    mimeType: 'application/json'
  }, async () => {
    return toResourceContents('ide://marketplace', state.marketplace || {});
  });

  const workspaceTemplate = new ResourceTemplate('ide://workspaces/{id}/{path}', {});
  server.registerResource('workspace-file', workspaceTemplate, {
    title: 'Workspace File',
    description: 'Contenido de archivo de workspace',
    mimeType: 'text/plain'
  }, async (uri, variables) => {
    const workspaceId = variables?.id;
    const filePath = sanitizeRelativePath(variables?.path || '');
    const fullPath = path.join(rootDir, 'workspaces', workspaceId, filePath);
    const content = await fs.readFile(fullPath, 'utf8');
    return {
      contents: [
        {
          uri: uri.toString(),
          mimeType: 'text/plain',
          text: content
        }
      ]
    };
  });

  return server;
}

module.exports = { createMcpServer };
