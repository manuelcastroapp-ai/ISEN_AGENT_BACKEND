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
    id: 'alchemical-agent',
    panel: {
      title: 'Alchemical Agent',
      render(container, ide) {
        container.innerHTML = `
          <div style="display:flex;flex-direction:column;gap:12px;">
            <p>Transmutation workflows and symbolic rituals.</p>
            <div style="display:flex;gap:8px;">
              <select id="alchemical-agent-action" class="panel-input" style="flex:1;"><option value="process">process</option><option value="ritual">ritual</option><option value="execute-ritual">execute-ritual</option><option value="transmute">transmute</option><option value="stone">stone</option><option value="symbol">symbol</option></select>
              <button class="btn" id="alchemical-agent-run">Run</button>
            </div>
            <textarea id="alchemical-agent-input" class="panel-input" rows="4" placeholder='{"concept": "transform..."}'></textarea>
            <pre id="alchemical-agent-output" class="panel-output" style="min-height:120px;"></pre>
          </div>
        `;

        const runBtn = container.querySelector('#alchemical-agent-run');
        const output = container.querySelector('#alchemical-agent-output');
        runBtn.addEventListener('click', async () => {
          const action = container.querySelector('#alchemical-agent-action').value;
          const payload = parsePayload(container.querySelector('#alchemical-agent-input').value);
          payload.action = action;
          output.textContent = 'Running...';
          try {
            const response = await fetch(ide.apiUrl('/api/agents/alchemical-agent/run'), {
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
