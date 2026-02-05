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
    id: 'holographic-renderer',
    panel: {
      title: 'Holographic Renderer',
      render(container, ide) {
        container.innerHTML = `
          <div style="display:flex;flex-direction:column;gap:12px;">
            <p>Render holographic scenes and visuals.</p>
            <div style="display:flex;gap:8px;">
              <select id="holographic-renderer-action" class="panel-input" style="flex:1;"><option value="render">render</option></select>
              <button class="btn" id="holographic-renderer-run">Run</button>
            </div>
            <textarea id="holographic-renderer-input" class="panel-input" rows="4" placeholder='{"concept": "scene"}'></textarea>
            <pre id="holographic-renderer-output" class="panel-output" style="min-height:120px;"></pre>
          </div>
        `;

        const runBtn = container.querySelector('#holographic-renderer-run');
        const output = container.querySelector('#holographic-renderer-output');
        runBtn.addEventListener('click', async () => {
          const action = container.querySelector('#holographic-renderer-action').value;
          const payload = parsePayload(container.querySelector('#holographic-renderer-input').value);
          payload.action = action;
          output.textContent = 'Running...';
          try {
            const response = await fetch(ide.apiUrl('/api/tools/holographic-renderer/run'), {
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
