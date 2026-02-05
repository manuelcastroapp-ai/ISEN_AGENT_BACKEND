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
    id: 'terra-agent',
    panel: {
      title: 'Terra Agent',
      render(container, ide) {
        container.innerHTML = `
          <div style="display:flex;flex-direction:column;gap:12px;">
            <p>Collective awareness and planetary alignment.</p>
            <div style="display:flex;gap:8px;">
              <select id="terra-agent-action" class="panel-input" style="flex:1;"><option value="elevate">elevate</option><option value="gaia">gaia</option><option value="align">align</option><option value="contribute">contribute</option><option value="sync">sync</option></select>
              <button class="btn" id="terra-agent-run">Run</button>
            </div>
            <textarea id="terra-agent-input" class="panel-input" rows="4" placeholder='{"intention": "align..."}'></textarea>
            <pre id="terra-agent-output" class="panel-output" style="min-height:120px;"></pre>
          </div>
        `;

        const runBtn = container.querySelector('#terra-agent-run');
        const output = container.querySelector('#terra-agent-output');
        runBtn.addEventListener('click', async () => {
          const action = container.querySelector('#terra-agent-action').value;
          const payload = parsePayload(container.querySelector('#terra-agent-input').value);
          payload.action = action;
          output.textContent = 'Running...';
          try {
            const response = await fetch(ide.apiUrl('/api/agents/terra-agent/run'), {
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
