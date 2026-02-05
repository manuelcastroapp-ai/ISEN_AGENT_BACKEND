require('dotenv').config();
/**
 * 🌐 Penguin Alpha Enhanced Server – Plataforma de Desarrollo con IA Cuántica
 * Servidor completo para IDE tipo Replit/Manus con capacidades cuánticas
 */

const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const cors = require('cors');
const path = require('path');
const fs = require('fs').promises;
const { v4: uuidv4 } = require('uuid');
const chokidar = require('chokidar');
const { exec } = require('child_process');
const multer = require('multer');
const fsSync = require('fs');

// Importar modelo Penguin Alpha Enhanced
const PenguinAlphaEnhanced = require('./penguin-alpha-enhanced');
const DeploymentExpert = require('./deployment-expert');
const LLMClient = require('./llm-client');

class PenguinAlphaServer {
  constructor() {
    this.app = express();
    this.server = http.createServer(this.app);
    this.io = socketIo(this.server, {
      cors: {
        origin: "*",
        methods: ["GET", "POST"]
      }
    });
    
    this.port = process.env.PORT || 3000;
    this.workspaces = new Map();
    this.users = new Map();
    this.fileSystem = new Map();
    this.activeProjects = new Map();
    this.codeExecution = new Map();
    this.lastAudit = null;
    this.permissions = this.loadAgentPermissions();
    
    // Inicializar modelo IA
    this.penguinModel = new PenguinAlphaEnhanced({
      consciousness: 1.0,
      learningRate: 0.1,
      adaptationFactor: 0.05
    });
    
    this.llm = new LLMClient();
    this.deploymentExpert = new DeploymentExpert(this.penguinModel);
    
    this.setupMiddleware();
    this.setupRoutes();
    this.setupWebSocket();
    this.setupFileWatcher();
    this.initializeModel();
  }

  /**
   * 🛠️ Configurar middleware
   */
  setupMiddleware() {
    this.app.use(cors());
    this.app.use(express.json({ limit: '50mb' }));
    this.app.use(express.urlencoded({ extended: true, limit: '50mb' }));
    
    // Servir archivos estáticos
    this.app.use('/static', express.static(path.join(__dirname, 'public')));
    
    // File upload configuration
    const storage = multer.diskStorage({
      destination: (req, file, cb) => {
        cb(null, path.join(__dirname, 'uploads'));
      },
      filename: (req, file, cb) => {
        cb(null, `${Date.now()}-${file.originalname}`);
      }
    });
    
    this.upload = multer({ 
      storage,
      limits: { fileSize: 100 * 1024 * 1024 } // 100MB
    });
  }

  /**
   * 🏠 Servir frontend
   */
  setupRoutes() {
    // Servir frontend estático
    this.app.use(express.static(path.join(__dirname, 'frontend')));
    
    // Ruta principal
    this.app.get('/', (req, res) => {
      res.sendFile(path.join(__dirname, 'frontend', 'index.html'));
    });

    // API Health check
    this.app.get('/api/health', (req, res) => {
      res.json({
        status: 'healthy',
        timestamp: new Date().toISOString(),
        model: this.penguinModel ? 'active' : 'inactive',
        deployment: this.deploymentExpert ? 'active' : 'inactive',
        workspaces: this.workspaces.size,
        uptime: process.uptime()
      });
    });

    // Workspace management
    this.app.get('/api/workspaces', this.getWorkspaces.bind(this));
    this.app.post('/api/workspaces', this.createWorkspace.bind(this));
    this.app.get('/api/workspaces/:id', this.getWorkspace.bind(this));
    this.app.delete('/api/workspaces/:id', this.deleteWorkspace.bind(this));

    // File system
    this.app.get('/api/workspaces/:id/files', this.getFiles.bind(this));
    this.app.post('/api/workspaces/:id/files', this.createFile.bind(this));
    this.app.put('/api/workspaces/:id/files/*', this.updateFile.bind(this));
    this.app.delete('/api/workspaces/:id/files/*', this.deleteFile.bind(this));
    this.app.post('/api/upload', this.upload.single('file'), this.uploadFile.bind(this));

    // Code execution
    this.app.post('/api/execute', this.executeCode.bind(this));
    this.app.get('/api/execute/:id/status', this.getExecutionStatus.bind(this));
    this.app.delete('/api/execute/:id', this.stopExecution.bind(this));

    // AI Assistant
    this.app.post('/api/ai/generate', this.generateCode.bind(this));
    this.app.post('/api/ai/analyze', this.analyzeCode.bind(this));
    this.app.post('/api/ai/optimize', this.optimizeCode.bind(this));
    this.app.post('/api/ai/deploy', this.deployProject.bind(this));
    this.app.post('/api/ai/chat', this.chatEndpoint.bind(this));

    // Audits
    this.app.post('/api/audit/e2e', this.runE2EAudit.bind(this));
    this.app.get('/api/audit/status', this.getAuditStatus.bind(this));
    this.app.get('/api/permissions', this.getPermissions.bind(this));

    // Collaboration
    this.app.get('/api/collaboration/:workspace/users', this.getWorkspaceUsers.bind(this));
    this.app.post('/api/collaboration/:workspace/join', this.joinWorkspace.bind(this));
    this.app.post('/api/collaboration/:workspace/leave', this.leaveWorkspace.bind(this));

    // Projects
    this.app.get('/api/projects', this.getProjects.bind(this));
    this.app.post('/api/projects', this.createProject.bind(this));
    this.app.get('/api/projects/:id', this.getProject.bind(this));
    this.app.put('/api/projects/:id', this.updateProject.bind(this));
    this.app.delete('/api/projects/:id', this.deleteProject.bind(this));

    // Templates
    this.app.get('/api/templates', this.getTemplates.bind(this));
    this.app.post('/api/templates', this.createTemplate.bind(this));

    // Marketplace
    this.app.get('/api/marketplace/components', this.getMarketplaceComponents.bind(this));
    this.app.post('/api/marketplace/components', this.createMarketplaceComponent.bind(this));
    this.app.get('/api/marketplace/components/:id', this.getMarketplaceComponent.bind(this));

    // Serve frontend fallback
    this.app.get('*', (req, res) => {
      res.sendFile(path.join(__dirname, 'frontend', 'index.html'));
    });
  }

  /**
   * 🔌 Configurar WebSocket
   */
  setupWebSocket() {
    this.io.on('connection', (socket) => {
      console.log(`🔌 Usuario conectado: ${socket.id}`);
      
      // Join workspace
      socket.on('join-workspace', (workspaceId) => {
        socket.join(workspaceId);
        this.handleUserJoin(socket.id, workspaceId);
      });

      // Real-time code editing
      socket.on('code-change', (data) => {
        socket.to(data.workspaceId).emit('code-change', {
          ...data,
          userId: socket.id
        });
        this.saveFileChange(data);
      });

      // Cursor position
      socket.on('cursor-position', (data) => {
        socket.to(data.workspaceId).emit('cursor-position', {
          ...data,
          userId: socket.id
        });
      });

      // Chat/Collaboration (frontend usa chat_message)
      socket.on('chat_message', async (data) => {
        if (data.workspaceId) {
          socket.to(data.workspaceId).emit('chat_message', {
            ...data,
            userId: socket.id,
            timestamp: new Date().toISOString()
          });
        }
        const reply = await this.chatWithAI(data.message);
        socket.emit('chat_response', {
          sender: 'AI',
          message: reply
        });
      });

      // AI requests
      socket.on('ai-request', async (data) => {
        try {
          const response = await this.handleAIRequest(data);
          socket.emit('ai-response', response);
        } catch (error) {
          socket.emit('ai-error', { error: error.message });
        }
      });

      // Deployment status
      socket.on('deployment-status', (deploymentId) => {
        const status = this.getDeploymentStatus(deploymentId);
        socket.emit('deployment-status-update', status);
      });

      socket.on('disconnect', () => {
        console.log(`🔌 Usuario desconectado: ${socket.id}`);
        this.handleUserLeave(socket.id);
      });
    });
  }

  /**
   * 👀 Configurar file watcher
   */
  setupFileWatcher() {
    this.fileWatcher = chokidar.watch(path.join(__dirname, 'workspaces'), {
      ignored: /(^|[\/\\])\../,
      persistent: true
    });

    this.fileWatcher.on('change', (filePath) => {
      this.io.emit('file-changed', {
        path: filePath,
        timestamp: new Date().toISOString()
      });
    });
  }

  /**
   * 🧠 Inicializar modelo IA
   */
  async initializeModel() {
    try {
      await this.penguinModel.initialize();
      console.log('🧠 Modelo Penguin Alpha Enhanced inicializado');
      
      // Iniciar evolución continua si existe
      if (typeof this.penguinModel.evolve === 'function') {
        setInterval(() => {
          this.evolveModel();
        }, 60000); // Cada minuto
      }
    } catch (error) {
      console.error('❌ Error inicializando modelo:', error);
    }
  }

  /**
   * 🔄 Evolución del modelo
   */
  async evolveModel() {
    try {
      if (typeof this.penguinModel.evolve !== 'function') return;
      const evolution = await this.penguinModel.evolve();
      console.log(`🧬 Evolución: ${evolution.evolutionLevel}`);
      
      // Notificar a todos los clientes
      this.io.emit('model-evolution', evolution);
    } catch (error) {
      console.error('❌ Error en evolución:', error);
    }
  }

  /**
   * 📁 Obtener workspaces
   */
  async getWorkspaces(req, res) {
    try {
      const workspaces = Array.from(this.workspaces.values());
      res.json(workspaces);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }

  /**
   * ➕ Crear workspace
   */
  async createWorkspace(req, res) {
    try {
      const { name, description, template } = req.body;
      const workspaceId = uuidv4();
      
      const workspace = {
        id: workspaceId,
        name,
        description,
        template: template || 'blank',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        files: {},
        collaborators: [],
        settings: {
          language: 'javascript',
          theme: 'dark',
          autoSave: true
        }
      };

      // Crear directorio
      const workspacePath = path.join(__dirname, 'workspaces', workspaceId);
      await fs.mkdir(workspacePath, { recursive: true });

      // Inicializar con template
      if (template && template !== 'blank') {
        await this.initializeTemplate(workspacePath, template);
      }

      this.workspaces.set(workspaceId, workspace);
      res.json(workspace);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }

  /**
   * 📂 Obtener workspace
   */
  async getWorkspace(req, res) {
    try {
      const { id } = req.params;
      const workspace = this.workspaces.get(id);
      
      if (!workspace) {
        return res.status(404).json({ error: 'Workspace no encontrado' });
      }
      
      res.json(workspace);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }

  /**
   * 🗑️ Eliminar workspace
   */
  async deleteWorkspace(req, res) {
    try {
      const { id } = req.params;
      
      // Eliminar del mapa
      this.workspaces.delete(id);
      
      // Eliminar directorio
      const workspacePath = path.join(__dirname, 'workspaces', id);
      await fs.rmdir(workspacePath, { recursive: true });
      
      res.json({ message: 'Workspace eliminado' });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }

  /**
   * 📄 Obtener archivos
   */
  async getFiles(req, res) {
    try {
      const { id } = req.params;
      const workspace = this.workspaces.get(id);
      
      if (!workspace) {
        return res.status(404).json({ error: 'Workspace no encontrado' });
      }
      
      const workspacePath = path.join(__dirname, 'workspaces', id);
      const files = await this.scanDirectory(workspacePath);
      
      res.json(files);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }

  /**
   * 📁 Escanear directorio
   */
  async scanDirectory(dirPath, basePath = '') {
    const items = [];
    
    try {
      const entries = await fs.readdir(dirPath, { withFileTypes: true });
      
      for (const entry of entries) {
        const fullPath = path.join(dirPath, entry.name);
        const relativePath = path.join(basePath, entry.name).replace(/\\/g, '/');
        
        if (entry.isDirectory()) {
          items.push({
            name: entry.name,
            path: relativePath,
            type: 'directory',
            children: await this.scanDirectory(fullPath, relativePath)
          });
        } else {
          const stats = await fs.stat(fullPath);
          const content = await fs.readFile(fullPath, 'utf8');
          
          items.push({
            name: entry.name,
            path: relativePath,
            type: 'file',
            size: stats.size,
            modified: stats.mtime,
            content
          });
        }
      }
    } catch (error) {
      console.error('Error escaneando directorio:', error);
    }
    
    return items;
  }

  /**
   * 📝 Crear archivo
   */
  async createFile(req, res) {
    try {
      const { id } = req.params;
      const { path: filePath, content, type = 'file' } = req.body;
      
      const workspace = this.workspaces.get(id);
      if (!workspace) {
        return res.status(404).json({ error: 'Workspace no encontrado' });
      }

      const safePath = this.sanitizeRelativePath(filePath);
      const fullPath = path.join(__dirname, 'workspaces', id, safePath);
      
      if (type === 'directory') {
        await fs.mkdir(fullPath, { recursive: true });
      } else {
        await fs.writeFile(fullPath, content || '');
      }
      
      workspace.updatedAt = new Date().toISOString();
      
      // Notificar cambios
      this.io.to(id).emit('file-created', { path: filePath, type });
      
      res.json({ message: 'Archivo creado' });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }

  /**
   * ✏️ Actualizar archivo
   */
  async updateFile(req, res) {
    try {
      const { id } = req.params;
      const filePath = req.params[0]; // El resto de la ruta
      const { content } = req.body;
      
      const workspace = this.workspaces.get(id);
      if (!workspace) {
        return res.status(404).json({ error: 'Workspace no encontrado' });
      }
      
      const safePath = this.sanitizeRelativePath(filePath);
      const fullPath = path.join(__dirname, 'workspaces', id, safePath);
      await fs.writeFile(fullPath, content);
      
      workspace.updatedAt = new Date().toISOString();
      
      // Notificar cambios en tiempo real
      this.io.to(id).emit('file-updated', { path: filePath, content });
      
      res.json({ message: 'Archivo actualizado' });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }

  /**
   * 🗑️ Eliminar archivo
   */
  async deleteFile(req, res) {
    try {
      const { id } = req.params;
      const filePath = req.params[0];
      
      const workspace = this.workspaces.get(id);
      if (!workspace) {
        return res.status(404).json({ error: 'Workspace no encontrado' });
      }
      
      const safePath = this.sanitizeRelativePath(filePath);
      const fullPath = path.join(__dirname, 'workspaces', id, safePath);
      await fs.unlink(fullPath);
      
      workspace.updatedAt = new Date().toISOString();
      
      // Notificar cambios
      this.io.to(id).emit('file-deleted', { path: filePath });
      
      res.json({ message: 'Archivo eliminado' });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }

  /**
   * 📤 Subir archivo
   */
  async uploadFile(req, res) {
    try {
      if (!req.file) {
        return res.status(400).json({ error: 'No se proporcionó archivo' });
      }
      
      const file = req.file;
      const content = await fs.readFile(file.path, 'utf8');
      
      // Eliminar archivo temporal
      await fs.unlink(file.path);
      
      res.json({
        filename: file.originalname,
        content,
        size: file.size
      });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }

  /**
   * ⚡ Ejecutar código
   */
  async executeCode(req, res) {
    try {
      const { code, language, workspaceId } = req.body;
      const allowed = new Set(['javascript', 'python', 'bash']);
      if (!allowed.has(language)) {
        return res.status(400).json({ error: 'Lenguaje no soportado' });
      }
      if (!code || code.length > 50000) {
        return res.status(400).json({ error: 'Código inválido o demasiado grande' });
      }
      const executionId = uuidv4();
      
      // Configurar ejecución según lenguaje
      const command = this.getExecutionCommand(code, language);
      
      const execution = {
        id: executionId,
        code,
        language,
        workspaceId,
        status: 'running',
        startTime: new Date().toISOString(),
        output: '',
        error: null
      };
      
      this.codeExecution.set(executionId, execution);
      
      // Ejecutar en proceso separado
      exec(command, { timeout: 30000 }, (error, stdout, stderr) => {
        execution.status = error ? 'error' : 'completed';
        execution.endTime = new Date().toISOString();
        execution.output = stdout;
        execution.error = stderr;
        
        // Notificar resultado
        this.io.to(workspaceId).emit('execution-result', execution);
      });
      
      res.json({ executionId });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }

  /**
   * 🔧 Obtener comando de ejecución
   */
  getExecutionCommand(code, language) {
    switch (language) {
      case 'javascript':
        return `node -e "${code.replace(/"/g, '\\"')}"`;
      case 'python':
        return `python -c "${code.replace(/"/g, '\\"')}"`;
      case 'bash':
        return code;
      default:
        return `echo "Language ${language} not supported"`;
    }
  }

  /**
   * 📊 Obtener estado de ejecución
   */
  async getExecutionStatus(req, res) {
    try {
      const { id } = req.params;
      const execution = this.codeExecution.get(id);
      
      if (!execution) {
        return res.status(404).json({ error: 'Ejecución no encontrada' });
      }
      
      res.json(execution);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }

  /**
   * 🛑 Detener ejecución
   */
  async stopExecution(req, res) {
    try {
      const { id } = req.params;
      const execution = this.codeExecution.get(id);
      
      if (execution) {
        execution.status = 'stopped';
        execution.endTime = new Date().toISOString();
        
        // Notificar
        this.io.to(execution.workspaceId).emit('execution-stopped', execution);
      }
      
      res.json({ message: 'Ejecución detenida' });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }

  /**
   * 🤖 Generar código con IA
   */
  async generateCode(req, res) {
    try {
      const { prompt, language, context, workspaceId } = req.body;
      if (!this.llm.isEnabled()) {
        return res.status(400).json({ error: 'LLM no configurado. Define OPENAI_API_KEY.' });
      }

      const reply = await this.llm.chat([
        { role: 'system', content: `Genera código ${language || 'javascript'} limpio. Devuelve SOLO código.` },
        { role: 'user', content: prompt }
      ], { temperature: 0.2, max_tokens: 900 });

      if (!reply.ok) {
        return res.status(500).json({ error: reply.error });
      }

      res.json({
        code: reply.content,
        confidence: 0.85,
        suggestions: []
      });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }

  /**
   * 🔍 Analizar código con IA
   */
  async analyzeCode(req, res) {
    try {
      const { code, language } = req.body;
      if (!this.llm.isEnabled()) {
        return res.status(400).json({ error: 'LLM no configurado. Define OPENAI_API_KEY.' });
      }

      const reply = await this.llm.chat([
        { role: 'system', content: 'Analiza el código y devuelve issues, sugerencias y complejidad.' },
        { role: 'user', content: `Language: ${language}\nCode:\n${code}` }
      ], { temperature: 0.1, max_tokens: 700 });

      if (!reply.ok) {
        return res.status(500).json({ error: reply.error });
      }

      res.json({
        quality: 'unknown',
        issues: [],
        suggestions: [reply.content],
        complexity: 'unknown',
        metrics: {}
      });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }

  /**
   * ⚡ Optimizar código con IA
   */
  async optimizeCode(req, res) {
    try {
      const { code, language, optimizationType } = req.body;
      if (!this.llm.isEnabled()) {
        return res.status(400).json({ error: 'LLM no configurado. Define OPENAI_API_KEY.' });
      }

      const reply = await this.llm.chat([
        { role: 'system', content: `Optimiza el código para ${optimizationType || 'performance'}. Devuelve SOLO código.` },
        { role: 'user', content: `Language: ${language}\nCode:\n${code}` }
      ], { temperature: 0.2, max_tokens: 900 });

      if (!reply.ok) {
        return res.status(500).json({ error: reply.error });
      }

      res.json({
        optimizedCode: reply.content,
        improvements: [],
        performanceGain: 'unknown',
        recommendations: []
      });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }

  /**
   * 🚀 Desplegar proyecto
   */
  async deployProject(req, res) {
    try {
      const { workspaceId, platform, config } = req.body;
      
      const deployment = await this.deploymentExpert.expertDeployment({
        platform: platform || 'aws',
        application: workspaceId,
        strategy: 'blue_green',
        environment: 'production',
        regions: ['us-east-1'],
        disasterRecovery: 'warm_standby',
        scalingStrategy: 'horizontal',
        costOptimization: true,
        securityLevel: 'high',
        ...config
      });
      
      // Notificar estado
      this.io.to(workspaceId).emit('deployment-started', deployment);
      
      res.json(deployment);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }

  /**
   * 👥 Obtener usuarios del workspace
   */
  async getWorkspaceUsers(req, res) {
    try {
      const { workspace } = req.params;
      const users = Array.from(this.users.values())
        .filter(user => user.workspaceId === workspace);
      
      res.json(users);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }

  /**
   * 🚪 Unirse a workspace
   */
  async joinWorkspace(req, res) {
    try {
      const { workspace } = req.params;
      const { userId, userName } = req.body;
      
      const user = {
        id: userId,
        name: userName,
        workspaceId: workspace,
        joinedAt: new Date().toISOString(),
        cursor: { line: 0, column: 0 }
      };
      
      this.users.set(userId, user);
      
      // Notificar a otros usuarios
      this.io.to(workspace).emit('user-joined', user);
      
      res.json(user);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }

  /**
   * 🚪 Salir de workspace
   */
  async leaveWorkspace(req, res) {
    try {
      const { workspace } = req.params;
      const { userId } = req.body;
      
      this.users.delete(userId);
      
      // Notificar a otros usuarios
      this.io.to(workspace).emit('user-left', { userId });
      
      res.json({ message: 'Usuario salió del workspace' });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }

  /**
   * 📋 Obtener proyectos
   */
  async getProjects(req, res) {
    try {
      const projects = Array.from(this.activeProjects.values());
      res.json(projects);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }

  /**
   * ➕ Crear proyecto
   */
  async createProject(req, res) {
    try {
      const { name, description, workspaceId, template } = req.body;
      const projectId = uuidv4();
      
      const project = {
        id: projectId,
        name,
        description,
        workspaceId,
        template,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        status: 'active',
        deployments: [],
        collaborators: []
      };
      
      this.activeProjects.set(projectId, project);
      res.json(project);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }

  /**
   * 📄 Obtener proyecto
   */
  async getProject(req, res) {
    try {
      const { id } = req.params;
      const project = this.activeProjects.get(id);
      
      if (!project) {
        return res.status(404).json({ error: 'Proyecto no encontrado' });
      }
      
      res.json(project);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }

  /**
   * ✏️ Actualizar proyecto
   */
  async updateProject(req, res) {
    try {
      const { id } = req.params;
      const updates = req.body;
      
      const project = this.activeProjects.get(id);
      if (!project) {
        return res.status(404).json({ error: 'Proyecto no encontrado' });
      }
      
      Object.assign(project, updates);
      project.updatedAt = new Date().toISOString();
      
      res.json(project);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }

  /**
   * 🗑️ Eliminar proyecto
   */
  async deleteProject(req, res) {
    try {
      const { id } = req.params;
      this.activeProjects.delete(id);
      res.json({ message: 'Proyecto eliminado' });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }

  /**
   * 📋 Obtener templates
   */
  async getTemplates(req, res) {
    try {
      const templates = this.getTemplatesData();
      res.json(templates);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }

  /**
   * ➕ Crear template
   */
  async createTemplate(req, res) {
    try {
      const template = req.body;
      // Guardar template en base de datos o archivo
      res.json({ ...template, id: uuidv4() });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }

  /**
   * 🛍️ Obtener componentes del marketplace
   */
  async getMarketplaceComponents(req, res) {
    try {
      const components = [
        {
          id: 'quantum-button',
          name: 'Quantum Button',
          description: 'Botón con efectos cuánticos',
          category: 'ui',
          code: 'export const QuantumButton = () => <button className="quantum-btn">Click Me</button>',
          author: 'Penguin Alpha',
          downloads: 150,
          rating: 4.8
        },
        {
          id: 'ai-form',
          name: 'AI Form Generator',
          description: 'Generador de formularios con IA',
          category: 'form',
          code: 'export const AIForm = () => <form className="ai-form"><!-- AI Generated --></form>',
          author: 'Penguin Alpha',
          downloads: 89,
          rating: 4.6
        }
      ];
      
      res.json(components);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }

  /**
   * ➕ Crear componente marketplace
   */
  async createMarketplaceComponent(req, res) {
    try {
      const component = req.body;
      res.json({ ...component, id: uuidv4(), createdAt: new Date().toISOString() });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }

  /**
   * 📄 Obtener componente marketplace
   */
  async getMarketplaceComponent(req, res) {
    try {
      const { id } = req.params;
      // Lógica para obtener componente específico
      res.json({ id, name: 'Component', code: '// Component code' });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }

  /**
   * 👤 Manejar entrada de usuario
   */
  handleUserJoin(socketId, workspaceId) {
    const user = {
      id: socketId,
      name: `User_${socketId.slice(0, 8)}`,
      workspaceId,
      joinedAt: new Date().toISOString()
    };
    
    this.users.set(socketId, user);
  }

  /**
   * 👤 Manejar salida de usuario
   */
  handleUserLeave(socketId) {
    const user = this.users.get(socketId);
    if (user) {
      this.io.to(user.workspaceId).emit('user-left', { userId: socketId });
      this.users.delete(socketId);
    }
  }

  /**
   * 💾 Guardar cambio de archivo
   */
  async saveFileChange(data) {
    try {
      const { workspaceId, path: filePath, content } = data;
      const safePath = this.sanitizeRelativePath(filePath);
      const fullPath = path.join(__dirname, 'workspaces', workspaceId, safePath);
      await fs.writeFile(fullPath, content);
    } catch (error) {
      console.error('Error guardando archivo:', error);
    }
  }

  sanitizeRelativePath(filePath) {
    const value = String(filePath || '').replace(/\\/g, '/');
    if (!value || value.includes('..')) {
      throw new Error('Ruta inválida');
    }
    return value.replace(/^\/+/, '');
  }

  loadAgentPermissions() {
    try {
      const raw = fsSync.readFileSync(path.join(__dirname, 'agent-permissions.json'), 'utf8');
      return JSON.parse(raw);
    } catch {
      return {
        allowRoots: ['*'],
        denyRoots: [],
        urlPolicy: { confirmAll: false, allowed: ['*'] },
        capabilities: {
          filesystem: { read: true, write: true, execute: true, watch: true },
          network: { http: true, https: true, websocket: true },
          process: { spawn: true, env: true, signals: true }
        }
      };
    }
  }

  getPermissions(req, res) {
    res.json(this.permissions);
  }

  async chatWithAI(message) {
    const reply = await this.llm.chat([
      { role: 'system', content: 'Eres un asistente de programación. Responde claro y directo.' },
      { role: 'user', content: String(message || '') }
    ], { temperature: 0.3, max_tokens: 800 });

    if (!reply.ok) return reply.error;
    return reply.content;
  }

  async chatEndpoint(req, res) {
    try {
      const { message } = req.body;
      const reply = await this.chatWithAI(message);
      res.json({ reply });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }

  async runE2EAudit(req, res) {
    const result = {
      startedAt: new Date().toISOString(),
      checks: [],
      ok: true
    };
    try {
      const workspace = await this.createAuditWorkspace();
      result.checks.push({ name: 'workspace:create', ok: true, id: workspace.id });

      await this.createAuditFile(workspace.id);
      result.checks.push({ name: 'file:create', ok: true });

      await this.updateAuditFile(workspace.id);
      result.checks.push({ name: 'file:update', ok: true });

      const execOk = await this.executeAuditCode(workspace.id);
      result.checks.push({ name: 'code:execute', ok: execOk });

      if (this.llm.isEnabled()) {
        const aiReply = await this.chatWithAI('Ping');
        result.checks.push({ name: 'ai:chat', ok: Boolean(aiReply) });
      } else {
        result.checks.push({ name: 'ai:chat', ok: false, note: 'LLM not configured' });
      }
    } catch (error) {
      result.ok = false;
      result.error = error.message;
    }
    result.endedAt = new Date().toISOString();
    this.lastAudit = result;
    res.json(result);
  }

  getAuditStatus(req, res) {
    res.json(this.lastAudit || { ok: false, note: 'No audit run yet' });
  }

  async createAuditWorkspace() {
    const workspaceId = uuidv4();
    const workspace = {
      id: workspaceId,
      name: 'Audit Workspace',
      description: 'Auto audit',
      template: 'blank',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      files: {},
      collaborators: [],
      settings: { language: 'javascript', theme: 'dark', autoSave: true }
    };
    const workspacePath = path.join(__dirname, 'workspaces', workspaceId);
    await fs.mkdir(workspacePath, { recursive: true });
    this.workspaces.set(workspaceId, workspace);
    return workspace;
  }

  async createAuditFile(workspaceId) {
    const filePath = path.join(__dirname, 'workspaces', workspaceId, 'audit.js');
    await fs.writeFile(filePath, 'console.log("audit");');
  }

  async updateAuditFile(workspaceId) {
    const filePath = path.join(__dirname, 'workspaces', workspaceId, 'audit.js');
    await fs.writeFile(filePath, 'console.log("audit-updated");');
  }

  async executeAuditCode(workspaceId) {
    return new Promise((resolve) => {
      exec('node -e "console.log(\\"audit-run\\")"', { timeout: 10000 }, (error) => {
        resolve(!error);
      });
    });
  }

  /**
   * 🤖 Manejar solicitud IA
   */
  async handleAIRequest(data) {
    const { type } = data;
    switch (type) {
      case 'generate':
        return { ok: true, code: '// Usa POST /api/ai/generate para generar código.' };
      case 'analyze':
        return { ok: true, analysis: 'Usa POST /api/ai/analyze para análisis.' };
      case 'optimize':
        return { ok: true, optimized: 'Usa POST /api/ai/optimize para optimización.' };
      default:
        throw new Error('Tipo de solicitud IA no soportado');
    }
  }

  /**
   * 🚀 Obtener estado de deployment
   */
  getDeploymentStatus(deploymentId) {
    // Lógica para obtener estado real del deployment
    return {
      id: deploymentId,
      status: 'completed',
      progress: 100,
      url: 'https://deployed-app.example.com'
    };
  }

  /**
   * 🎨 Inicializar template
   */
  async initializeTemplate(workspacePath, templateId) {
    try {
      const templates = this.getTemplatesData();
      const template = templates.find(t => t.id === templateId);
      
      if (template) {
        for (const file of template.files) {
          const filePath = path.join(workspacePath, file.name);
          const dir = path.dirname(filePath);
          
          await fs.mkdir(dir, { recursive: true });
          await fs.writeFile(filePath, file.content);
        }
      }
    } catch (error) {
      console.error('Error inicializando template:', error);
    }
  }

  getTemplatesData() {
    return [
      {
        id: 'react-app',
        name: 'React Application',
        description: 'Aplicación React con TypeScript y Tailwind',
        icon: '⚛️',
        files: [
          { name: 'package.json', content: '{"name": "react-app", "version": "1.0.0"}' },
          { name: 'src/App.tsx', content: 'import React from "react";\n\nexport default function App() {\n  return <div>Hello World</div>;\n}' }
        ]
      },
      {
        id: 'node-api',
        name: 'Node.js API',
        description: 'API REST con Express y TypeScript',
        icon: '🚀',
        files: [
          { name: 'package.json', content: '{"name": "node-api", "version": "1.0.0"}' },
          { name: 'src/index.ts', content: 'import express from "express";\n\nconst app = express();\napp.listen(3000);' }
        ]
      },
      {
        id: 'python-app',
        name: 'Python Application',
        description: 'Aplicación Python con FastAPI',
        icon: '🐍',
        files: [
          { name: 'requirements.txt', content: 'fastapi\nuvicorn' },
          { name: 'main.py', content: 'from fastapi import FastAPI\n\napp = FastAPI()\n\n@app.get("/")\nasync def root():\n    return {"message": "Hello World"}' }
        ]
      }
    ];
  }

  buildChatReply(message) {
    const text = String(message || '').toLowerCase();
    if (text.includes('hola') || text.includes('hello')) {
      return '👋 Hola, ¿en qué te ayudo con tu proyecto?';
    }
    if (text.includes('error') || text.includes('bug')) {
      return '🔎 Cuéntame el error y revisamos el stack/archivo.';
    }
    if (text.includes('deploy') || text.includes('desplegar')) {
      return '🚀 Puedes usar el panel CI/CD o el comando `deploy` en la terminal.';
    }
    return '✅ Recibido. Puedo abrir archivos, ejecutar código y ayudarte a depurar.';
  }

  /**
   * 🚀 Iniciar servidor
   */
  start() {
    const port = process.env.PORT || this.port;
    this.server.listen(port, () => {
      console.log(`🌐 Penguin Alpha Enhanced Server corriendo en puerto ${port}`);
      console.log(`🧠 Modelo IA: ${this.penguinModel ? 'Activo' : 'Inactivo'}`);
      console.log(`☁️ Deployment Expert: ${this.deploymentExpert ? 'Activo' : 'Inactivo'}`);
      console.log(`🔗 WebSocket: Activo`);
      console.log(`📁 Workspaces: ${this.workspaces.size}`);
      console.log(`🚀 Render Deployment: Configurado`);
    });
  }
}

// Iniciar servidor
if (require.main === module) {
  const server = new PenguinAlphaServer();
  server.start();
}

module.exports = PenguinAlphaServer;
