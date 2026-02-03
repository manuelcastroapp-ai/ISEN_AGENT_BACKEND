// 🧠 Penguin Alpha Enhanced IDE - Frontend Application
class PenguinAlphaIDE {
    constructor() {
        this.socket = null;
        this.currentWorkspace = null;
        this.currentFile = null;
        this.workspaces = [];
        this.files = [];
        this.activeUsers = [];
        
        this.initializeSocket();
        this.initializeEventListeners();
        this.loadWorkspaces();
    }

    // 🔌 Initialize Socket.IO connection
    initializeSocket() {
        this.socket = io();
        
        this.socket.on('connect', () => {
            this.updateConnectionStatus(true);
            console.log('🔌 Conectado al servidor');
        });

        this.socket.on('disconnect', () => {
            this.updateConnectionStatus(false);
            console.log('🔌 Desconectado del servidor');
        });

        this.socket.on('workspace-users', (users) => {
            this.updateActiveUsers(users);
        });

        this.socket.on('code-change', (data) => {
            if (data.file !== this.currentFile) return;
            const editor = document.getElementById('code-editor');
            if (editor.value !== data.content) {
                editor.value = data.content;
            }
        });

        this.socket.on('execution-result', (data) => {
            this.terminalOutput(data.output, data.error ? 'error' : 'success');
        });

        this.socket.on('ai-response', (data) => {
            this.showAIResponse(data.response);
        });

        this.socket.on('deployment-status', (data) => {
            this.terminalOutput(`🚀 Deployment: ${data.status}`, 'info');
        });
    }

    // 🎯 Initialize event listeners
    initializeEventListeners() {
        // Workspace management
        document.getElementById('new-workspace').addEventListener('click', () => {
            this.showWorkspaceModal();
        });

        document.getElementById('create-workspace').addEventListener('click', () => {
            this.createWorkspace();
        });

        document.getElementById('cancel-workspace').addEventListener('click', () => {
            this.hideWorkspaceModal();
        });

        // File operations
        document.getElementById('save-file').addEventListener('click', () => {
            this.saveCurrentFile();
        });

        // Code editor
        document.getElementById('code-editor').addEventListener('input', (e) => {
            this.broadcastCodeChange(e.target.value);
        });

        // Code execution
        document.getElementById('run-code').addEventListener('click', () => {
            this.executeCode();
        });

        // AI Assistant
        document.getElementById('generate-code').addEventListener('click', () => {
            this.generateCode();
        });

        document.getElementById('analyze-code').addEventListener('click', () => {
            this.analyzeCode();
        });

        // Deployment
        document.getElementById('deploy-code').addEventListener('click', () => {
            this.deployProject();
        });

        // Terminal
        document.getElementById('clear-terminal').addEventListener('click', () => {
            this.clearTerminal();
        });

        // Language selection
        document.getElementById('language-select').addEventListener('change', (e) => {
            this.changeLanguage(e.target.value);
        });
    }

    // 📁 Load workspaces
    async loadWorkspaces() {
        try {
            const response = await fetch('/api/workspaces');
            this.workspaces = await response.json();
            this.updateFileTree();
        } catch (error) {
            console.error('Error loading workspaces:', error);
            this.terminalOutput('❌ Error cargando workspaces', 'error');
        }
    }

    // 🆕 Create new workspace
    async createWorkspace() {
        const name = document.getElementById('workspace-name').value;
        const description = document.getElementById('workspace-description').value;

        if (!name) {
            alert('Por favor ingresa un nombre para el workspace');
            return;
        }

        try {
            const response = await fetch('/api/workspaces', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ name, description })
            });

            const workspace = await response.json();
            this.workspaces.push(workspace);
            this.currentWorkspace = workspace;
            this.hideWorkspaceModal();
            this.updateFileTree();
            this.terminalOutput(`✅ Workspace "${name}" creado exitosamente`, 'success');
        } catch (error) {
            console.error('Error creating workspace:', error);
            this.terminalOutput('❌ Error creando workspace', 'error');
        }
    }

    // 📂 Update file tree
    updateFileTree() {
        const fileTree = document.getElementById('file-tree');
        fileTree.innerHTML = '';

        this.workspaces.forEach(workspace => {
            const workspaceEl = document.createElement('div');
            workspaceEl.className = 'workspace-item';
            workspaceEl.innerHTML = `
                <div class="flex items-center space-x-2 p-2 hover:bg-white/10 rounded cursor-pointer" onclick="ide.selectWorkspace('${workspace.id}')">
                    <i data-lucide="folder" class="w-4 h-4"></i>
                    <span class="text-sm">${workspace.name}</span>
                </div>
                <div id="files-${workspace.id}" class="ml-4 space-y-1 hidden">
                    <!-- Files will be loaded here -->
                </div>
            `;
            fileTree.appendChild(workspaceEl);
        });

        // Re-initialize lucide icons
        lucide.createIcons();
    }

    // 📁 Select workspace
    async selectWorkspace(workspaceId) {
        this.currentWorkspace = this.workspaces.find(w => w.id === workspaceId);
        
        // Toggle file visibility
        document.querySelectorAll('[id^="files-"]').forEach(el => el.classList.add('hidden'));
        const filesEl = document.getElementById(`files-${workspaceId}`);
        filesEl.classList.remove('hidden');

        // Load workspace files
        try {
            const response = await fetch(`/api/workspaces/${workspaceId}/files`);
            const files = await response.json();
            
            filesEl.innerHTML = '';
            files.forEach(file => {
                const fileEl = document.createElement('div');
                fileEl.className = 'flex items-center space-x-2 p-2 hover:bg-white/10 rounded cursor-pointer';
                fileEl.innerHTML = `
                    <i data-lucide="file" class="w-4 h-4"></i>
                    <span class="text-sm">${file.name}</span>
                `;
                fileEl.onclick = () => this.selectFile(file);
                filesEl.appendChild(fileEl);
            });

            lucide.createIcons();
        } catch (error) {
            console.error('Error loading files:', error);
        }
    }

    // 📄 Select file
    async selectFile(file) {
        this.currentFile = file;
        document.getElementById('current-file').textContent = file.name;
        
        try {
            const response = await fetch(`/api/files/${file.id}`);
            const fileContent = await response.json();
            document.getElementById('code-editor').value = fileContent.content || '';
            
            // Join workspace room for real-time collaboration
            this.socket.emit('join-workspace', this.currentWorkspace.id);
        } catch (error) {
            console.error('Error loading file:', error);
        }
    }

    // 💾 Save current file
    async saveCurrentFile() {
        if (!this.currentFile) {
            this.terminalOutput('❌ No hay archivo seleccionado', 'error');
            return;
        }

        const content = document.getElementById('code-editor').value;

        try {
            await fetch(`/api/files/${this.currentFile.id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ content })
            });

            this.terminalOutput(`✅ Archivo "${this.currentFile.name}" guardado`, 'success');
        } catch (error) {
            console.error('Error saving file:', error);
            this.terminalOutput('❌ Error guardando archivo', 'error');
        }
    }

    // ⚡ Execute code
    async executeCode() {
        const code = document.getElementById('code-editor').value;
        const language = document.getElementById('language-select').value;

        if (!code.trim()) {
            this.terminalOutput('❌ No hay código para ejecutar', 'error');
            return;
        }

        try {
            const response = await fetch('/api/execute', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ code, language, workspaceId: this.currentWorkspace?.id })
            });

            const result = await response.json();
            this.terminalOutput(result.output, result.error ? 'error' : 'success');
        } catch (error) {
            console.error('Error executing code:', error);
            this.terminalOutput('❌ Error ejecutando código', 'error');
        }
    }

    // 🤖 Generate code with AI
    async generateCode() {
        const prompt = document.getElementById('ai-prompt').value;
        if (!prompt.trim()) {
            this.terminalOutput('❌ Por favor ingresa un prompt para generar código', 'error');
            return;
        }

        try {
            const response = await fetch('/api/ai/generate', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ 
                    prompt, 
                    language: document.getElementById('language-select').value,
                    context: document.getElementById('code-editor').value,
                    workspaceId: this.currentWorkspace?.id
                })
            });

            const result = await response.json();
            document.getElementById('code-editor').value = result.code;
            this.showAIResponse(result.explanation);
            this.terminalOutput('✅ Código generado exitosamente', 'success');
        } catch (error) {
            console.error('Error generating code:', error);
            this.terminalOutput('❌ Error generando código', 'error');
        }
    }

    // 🔍 Analyze code with AI
    async analyzeCode() {
        const code = document.getElementById('code-editor').value;
        if (!code.trim()) {
            this.terminalOutput('❌ No hay código para analizar', 'error');
            return;
        }

        try {
            const response = await fetch('/api/ai/analyze', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ code })
            });

            const result = await response.json();
            this.showAIResponse(result.analysis);
            this.terminalOutput('✅ Análisis completado', 'success');
        } catch (error) {
            console.error('Error analyzing code:', error);
            this.terminalOutput('❌ Error analizando código', 'error');
        }
    }

    // 🚀 Deploy project
    async deployProject() {
        if (!this.currentWorkspace) {
            this.terminalOutput('❌ Por favor selecciona un workspace', 'error');
            return;
        }

        try {
            const response = await fetch('/api/deploy', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ 
                    workspaceId: this.currentWorkspace.id,
                    platform: 'vercel' // o 'render', 'netlify', etc.
                })
            });

            const deployment = await response.json();
            this.terminalOutput(`🚀 Deployment iniciado: ${deployment.id}`, 'info');
        } catch (error) {
            console.error('Error deploying:', error);
            this.terminalOutput('❌ Error en deployment', 'error');
        }
    }

    // 📡 Broadcast code changes
    broadcastCodeChange(content) {
        if (this.currentFile && this.socket) {
            this.socket.emit('code-change', {
                file: this.currentFile.id,
                content: content
            });
        }
    }

    // 🖥️ Terminal output
    terminalOutput(message, type = 'info') {
        const terminal = document.getElementById('terminal-output');
        const timestamp = new Date().toLocaleTimeString();
        const colorClass = {
            'success': 'text-green-400',
            'error': 'text-red-400',
            'info': 'text-blue-400'
        }[type] || 'text-gray-400';

        const output = document.createElement('div');
        output.className = `${colorClass} mb-1`;
        output.innerHTML = `<span class="text-gray-500">[${timestamp}]</span> ${message}`;
        
        terminal.appendChild(output);
        terminal.scrollTop = terminal.scrollHeight;
    }

    // 🤖 Show AI response
    showAIResponse(response) {
        const responseEl = document.getElementById('ai-response');
        responseEl.innerHTML = response;
        responseEl.classList.remove('hidden');
    }

    // 🔌 Update connection status
    updateConnectionStatus(connected) {
        const statusEl = document.getElementById('connection-status');
        const dot = statusEl.querySelector('div');
        const text = statusEl.querySelector('span');
        
        if (connected) {
            dot.className = 'w-3 h-3 bg-green-500 rounded-full';
            text.textContent = 'Conectado';
        } else {
            dot.className = 'w-3 h-3 bg-red-500 rounded-full';
            text.textContent = 'Desconectado';
        }
    }

    // 👥 Update active users
    updateActiveUsers(users) {
        const usersEl = document.getElementById('active-users');
        usersEl.innerHTML = '';
        
        users.forEach(user => {
            const userEl = document.createElement('div');
            userEl.className = 'flex items-center space-x-2 bg-white/10 rounded-full px-3 py-1';
            userEl.innerHTML = `
                <div class="w-2 h-2 bg-green-400 rounded-full"></div>
                <span class="text-sm">${user.name}</span>
            `;
            usersEl.appendChild(userEl);
        });
    }

    // 🎨 Change language
    changeLanguage(language) {
        // Update editor syntax highlighting if needed
        console.log('Language changed to:', language);
    }

    // 🗑️ Clear terminal
    clearTerminal() {
        document.getElementById('terminal-output').innerHTML = '<div class="text-gray-500">$ Terminal lista...</div>';
    }

    // 📋 Modal management
    showWorkspaceModal() {
        document.getElementById('workspace-modal').classList.remove('hidden');
    }

    hideWorkspaceModal() {
        document.getElementById('workspace-modal').classList.add('hidden');
        document.getElementById('workspace-name').value = '';
        document.getElementById('workspace-description').value = '';
    }
}

// 🚀 Initialize the IDE
const ide = new PenguinAlphaIDE();

// 🎨 Initialize Lucide icons
lucide.createIcons();
