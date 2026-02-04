/* eslint-disable no-console */
const baseUrl = process.env.AUDIT_BASE_URL || 'http://localhost:3000';

async function request(path, options) {
  const res = await fetch(`${baseUrl}${path}`, {
    headers: { 'Content-Type': 'application/json' },
    ...options
  });
  const text = await res.text();
  let data;
  try {
    data = JSON.parse(text);
  } catch {
    data = { raw: text };
  }
  return { ok: res.ok, status: res.status, data };
}

async function run() {
  const results = [];

  const health = await request('/api/health');
  results.push({ name: 'health', ok: health.ok, status: health.status });

  const workspace = await request('/api/workspaces', {
    method: 'POST',
    body: JSON.stringify({ name: 'E2E Workspace', description: 'audit', template: 'blank' })
  });
  results.push({ name: 'workspace:create', ok: workspace.ok });

  const workspaceId = workspace.data.id;
  if (!workspaceId) throw new Error('Workspace not created');

  const fileCreate = await request(`/api/workspaces/${workspaceId}/files`, {
    method: 'POST',
    body: JSON.stringify({ path: 'e2e.js', content: 'console.log(\"e2e\");' })
  });
  results.push({ name: 'file:create', ok: fileCreate.ok });

  const fileUpdate = await request(`/api/workspaces/${workspaceId}/files/e2e.js`, {
    method: 'PUT',
    body: JSON.stringify({ content: 'console.log(\"e2e-updated\");' })
  });
  results.push({ name: 'file:update', ok: fileUpdate.ok });

  const exec = await request('/api/execute', {
    method: 'POST',
    body: JSON.stringify({ code: 'console.log(\"e2e-run\");', language: 'javascript', workspaceId })
  });
  results.push({ name: 'code:execute', ok: exec.ok });

  const ai = await request('/api/ai/chat', {
    method: 'POST',
    body: JSON.stringify({ message: 'Ping' })
  });
  results.push({ name: 'ai:chat', ok: ai.ok });

  const failed = results.filter(r => !r.ok);
  if (failed.length) {
    console.error('❌ E2E audit failed:', failed);
    process.exit(1);
  }
  console.log('✅ E2E audit passed:', results);
}

run().catch((err) => {
  console.error('❌ E2E audit error:', err.message);
  process.exit(1);
});
