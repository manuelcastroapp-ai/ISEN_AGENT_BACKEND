(() => {
  window.PenguinExtensionHost.registerExtension({
    id: 'frontend-agent',
    panel: {
      title: 'Frontend Agent',
      render(container, ide) {
        container.innerHTML = `
          <div style="display:flex;flex-direction:column;gap:12px;">
            <p>Genera componentes UI y propone refactors de estilos.</p>
            <button class="btn" id="ui-generate">Generate Component</button>
            <pre id="ui-output" class="terminal" style="min-height:120px;"></pre>
          </div>
        `;
        container.querySelector('#ui-generate').addEventListener('click', () => {
          const output = container.querySelector('#ui-output');
          output.textContent = `<button class="btn">Primary</button>\n.card { border: 1px solid #3e3e42; padding: 12px; }`;
        });
      }
    },
    hooks: {
      onOpenFile(payload, { ide }) {
        if (payload.filePath.endsWith('.css')) {
          ide.addChatMessage('🎨 Frontend Agent: estilo abierto, listo para refactor', 'Frontend Agent', 'system');
        }
      }
    },
    activate() {}
  });
})();
