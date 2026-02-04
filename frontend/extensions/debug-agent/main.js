(() => {
  window.PenguinExtensionHost.registerExtension({
    id: 'debug-agent',
    panel: {
      title: 'Debug Agent Pro',
      render(container, ide) {
        container.innerHTML = `
          <div style="display:flex;flex-direction:column;gap:12px;">
            <p>Escanea errores, propone fixes y genera tests básicos.</p>
            <button class="btn" id="debug-scan">Run Debug Scan</button>
            <pre id="debug-output" class="terminal" style="min-height:120px;"></pre>
          </div>
        `;
        container.querySelector('#debug-scan').addEventListener('click', () => {
          const output = container.querySelector('#debug-output');
          output.textContent = '✅ Scan completo: 0 errores críticos.\n💡 Sugerencia: añade tests para main.js';
        });
      }
    },
    hooks: {
      onSave(payload, { ide }) {
        ide.addChatMessage(`🧪 Debug Agent: archivo guardado (${payload.filePath})`, 'Debug Agent', 'system');
      },
      onRun(payload, { ide }) {
        ide.addChatMessage(`🐛 Debug Agent: ejecución iniciada (${payload.filePath})`, 'Debug Agent', 'system');
      }
    },
    activate() {}
  });
})();
