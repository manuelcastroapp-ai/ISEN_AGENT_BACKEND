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
    id: 'quantum-agent',
    panel: {
      title: 'Quantum Agent',
      render(container, ide) {
        container.innerHTML = `
          <div style="display:flex;flex-direction:column;gap:12px;">
            <p>Quantum reasoning, superposition, and prediction.</p>
            <div style="display:flex;gap:8px;">
              <select id="quantum-agent-action" class="panel-input" style="flex:1;"><option value="reason">reason</option><option value="superposition">superposition</option><option value="nonlinear">nonlinear</option><option value="predict">predict</option><option value="entangle">entangle</option><option value="collapse">collapse</option></select>
              <button class="btn" id="quantum-agent-run">Run</button>
            </div>
            <textarea id="quantum-agent-input" class="panel-input" rows="4" placeholder='{"task": "describe..."}'></textarea>
            <pre id="quantum-agent-output" class="panel-output" style="min-height:120px;"></pre>
          </div>
        `;

        const runBtn = container.querySelector('#quantum-agent-run');
        const output = container.querySelector('#quantum-agent-output');
        runBtn.addEventListener('click', async () => {
          const action = container.querySelector('#quantum-agent-action').value;
          const payload = parsePayload(container.querySelector('#quantum-agent-input').value);
          payload.action = action;
          output.textContent = 'Running...';
          try {
            const response = await fetch(ide.apiUrl('/api/agents/quantum-agent/run'), {
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
