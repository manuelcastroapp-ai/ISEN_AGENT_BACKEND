(() => {
  window.PenguinExtensionHost.registerExtension({
    id: 'devops-agent',
    panel: {
      title: 'DevOps Agent',
      render(container, ide) {
        container.innerHTML = `
          <div style="display:flex;flex-direction:column;gap:12px;">
            <p>Genera pipelines CI/CD y checklists de deploy.</p>
            <button class="btn" id="pipeline-generate">Generate Pipeline</button>
            <pre id="pipeline-output" class="terminal" style="min-height:120px;"></pre>
          </div>
        `;
        container.querySelector('#pipeline-generate').addEventListener('click', () => {
          const output = container.querySelector('#pipeline-output');
          output.textContent = `name: CI\non: [push]\njobs:\n  build:\n    runs-on: ubuntu-latest\n    steps:\n      - uses: actions/checkout@v3\n      - run: npm install\n      - run: npm test`;
        });
      }
    },
    hooks: {
      onRun(payload, { ide }) {
        ide.addChatMessage(`🚀 DevOps Agent: ejecutando ${payload.filePath}`, 'DevOps Agent', 'system');
      }
    },
    activate() {}
  });
})();
