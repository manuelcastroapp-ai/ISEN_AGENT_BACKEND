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
    id: 'fractal-designer',
    panel: {
      title: 'Fractal Designer',
      render(container, ide) {
        container.innerHTML = `
          <div style="display:flex;flex-direction:column;gap:12px;">
            <p>Generate fractal patterns and templates.</p>
            <div style="display:flex;gap:8px;">
              <select id="fractal-designer-action" class="panel-input" style="flex:1;"><option value="generate">generate</option></select>
              <button class="btn" id="fractal-designer-run">Run</button>
            </div>
            <textarea id="fractal-designer-input" class="panel-input" rows="4" placeholder='{"type": "mandelbrot"}'></textarea>
            <pre id="fractal-designer-output" class="panel-output" style="min-height:120px;"></pre>
          </div>
        `;

        const runBtn = container.querySelector('#fractal-designer-run');
        const output = container.querySelector('#fractal-designer-output');
        runBtn.addEventListener('click', async () => {
          const action = container.querySelector('#fractal-designer-action').value;
          const payload = parsePayload(container.querySelector('#fractal-designer-input').value);
          payload.action = action;
          output.textContent = 'Running...';
          try {
            const response = await fetch(ide.apiUrl('/api/tools/fractal-designer/run'), {
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
