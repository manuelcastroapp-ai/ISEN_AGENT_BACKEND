const path = require('path');
const { StdioServerTransport } = require('@modelcontextprotocol/sdk/server/stdio');
const { StateStore } = require('../services/state-store');
const IdeRegistry = require('../services/agent-registry');
const { createMcpServer } = require('../services/mcp-server');
const LLMClient = require('../llm-client');

async function main() {
  const rootDir = path.resolve(__dirname, '..');
  const stateStore = new StateStore({ filePath: path.join(rootDir, 'data', 'ide-state.json') });
  const state = await stateStore.load();

  const llm = new LLMClient();
  const registry = new IdeRegistry({ llm, permissions: { allowRoots: [rootDir] }, rootDir });
  await registry.initialize();

  const server = createMcpServer({ registry, state, rootDir });
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.log('ISEN MCP server running (stdio)');
}

main().catch(error => {
  console.error('MCP server error:', error);
  process.exit(1);
});
