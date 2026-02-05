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
    id: 'neural-synth',
    panel: {
      title: 'Neural Synth',
      render(container, ide) {
        container.innerHTML = `
          <div style="display:flex;flex-direction:column;gap:12px;">
            <p>Design neural networks and ML blueprints.</p>
            <div style="display:flex;gap:8px;">
              <select id="neural-synth-action" class="panel-input" style="flex:1;"><option value="design">design</option></select>
              <button class="btn" id="neural-synth-run">Run</button>
            </div>
            <textarea id="neural-synth-input" class="panel-input" rows="4" placeholder='{"task": "classification"}'></textarea>
            <pre id="neural-synth-output" class="panel-output" style="min-height:120px;"></pre>
          </div>
        `;

        const runBtn = container.querySelector('#neural-synth-run');
        const output = container.querySelector('#neural-synth-output');
        runBtn.addEventListener('click', async () => {
          const action = container.querySelector('#neural-synth-action').value;
          const payload = parsePayload(container.querySelector('#neural-synth-input').value);
          payload.action = action;
          output.textContent = 'Running...';
          try {
            const response = await fetch(ide.apiUrl('/api/tools/neural-synth/run'), {
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
