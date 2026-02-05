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
    id: 'spatial-agent',
    panel: {
      title: 'Spatial Agent',
      render(container, ide) {
        container.innerHTML = `
          <div style="display:flex;flex-direction:column;gap:12px;">
            <p>3D mapping, holography, and spatial insights.</p>
            <div style="display:flex;gap:8px;">
              <select id="spatial-agent-action" class="panel-input" style="flex:1;"><option value="map">map</option><option value="hologram">hologram</option><option value="visualize">visualize</option></select>
              <button class="btn" id="spatial-agent-run">Run</button>
            </div>
            <textarea id="spatial-agent-input" class="panel-input" rows="4" placeholder='{"concept": "map..."}'></textarea>
            <pre id="spatial-agent-output" class="panel-output" style="min-height:120px;"></pre>
          </div>
        `;

        const runBtn = container.querySelector('#spatial-agent-run');
        const output = container.querySelector('#spatial-agent-output');
        runBtn.addEventListener('click', async () => {
          const action = container.querySelector('#spatial-agent-action').value;
          const payload = parsePayload(container.querySelector('#spatial-agent-input').value);
          payload.action = action;
          output.textContent = 'Running...';
          try {
            const response = await fetch(ide.apiUrl('/api/agents/spatial-agent/run'), {
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
