(() => {
  const parsePayload = (value) => {
    const text = String(value || '').trim();
    if (!text) return {};
    try {
      return JSON.parse(text);
    } catch {
      return { task: text, input: text, concept: text };
    }
  };

  window.PenguinExtensionHost.registerExtension({
    id: 'self-dev-agent',
    panel: {
      title: 'Self Dev Agent',
      render(container, ide) {
        container.innerHTML = `
          <div style="display:flex;flex-direction:column;gap:12px;">
            <p>Project scanning, readiness scoring, and planning.</p>
            <div style="display:flex;gap:8px;">
              <select id="self-dev-agent-action" class="panel-input" style="flex:1;"><option value="scan">scan</option><option value="plan">plan</option></select>
              <button class="btn" id="self-dev-agent-run">Run</button>
            </div>
            <textarea id="self-dev-agent-input" class="panel-input" rows="4" placeholder='{"roots": ["D:/agentes ISEN"]}'></textarea>
            <pre id="self-dev-agent-output" class="panel-output" style="min-height:120px;"></pre>
          </div>
        `;

        const runBtn = container.querySelector('#self-dev-agent-run');
        const output = container.querySelector('#self-dev-agent-output');
        runBtn.addEventListener('click', async () => {
          const action = container.querySelector('#self-dev-agent-action').value;
          const payload = parsePayload(container.querySelector('#self-dev-agent-input').value);
          payload.action = action;
          output.textContent = 'Running...';
          try {
            const response = await fetch(ide.apiUrl('/api/agents/self-dev-agent/run'), {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify(payload)
            });
            const data = await response.json();
            output.textContent = JSON.stringify(data, null, 2);
          } catch (error) {
            output.textContent = 'Error: ' + (error && error.message ? error.message : String(error));
          }
        });
      }
    },
    activate() {}
  });
})();
