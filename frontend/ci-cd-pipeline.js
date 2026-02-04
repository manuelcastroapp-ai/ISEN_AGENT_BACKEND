// 🔄 CI/CD Pipeline Automation - Feedback Applied

class CICDPipeline {
    constructor(ide) {
        this.ide = ide;
        this.pipelines = new Map();
        this.currentPipeline = null;
        this.buildHistory = [];
        this.deployments = [];
        this.initialize();
    }

    // 🚀 Initialize CI/CD Pipeline
    async initialize() {
        this.setupDefaultPipelines();
        this.setupEventListeners();
        this.startPipelineMonitoring();
        this.ide.addChatMessage('🔄 CI/CD Pipeline initialized', 'DevOps', 'system');
    }

    // ⚙️ Setup Default Pipelines
    setupDefaultPipelines() {
        // Frontend Pipeline
        this.pipelines.set('frontend', {
            name: 'Frontend Build & Deploy',
            stages: [
                { name: 'Install Dependencies', command: 'npm install', duration: 30 },
                { name: 'Lint Code', command: 'npm run lint', duration: 15 },
                { name: 'Run Tests', command: 'npm test', duration: 45 },
                { name: 'Build Application', command: 'npm run build', duration: 60 },
                { name: 'Deploy to Netlify', command: 'netlify deploy --prod', duration: 30 }
            ],
            triggers: ['push to main', 'manual'],
            environment: 'production',
            enabled: true
        });

        // Backend Pipeline
        this.pipelines.set('backend', {
            name: 'Backend Build & Deploy',
            stages: [
                { name: 'Install Dependencies', command: 'npm install', duration: 30 },
                { name: 'Run Unit Tests', command: 'npm run test:unit', duration: 30 },
                { name: 'Run Integration Tests', command: 'npm run test:integration', duration: 60 },
                { name: 'Build Application', command: 'npm run build', duration: 45 },
                { name: 'Deploy to Server', command: 'npm run deploy', duration: 60 }
            ],
            triggers: ['push to main', 'manual'],
            environment: 'production',
            enabled: true
        });

        // Full Stack Pipeline
        this.pipelines.set('fullstack', {
            name: 'Full Stack Pipeline',
            stages: [
                { name: 'Frontend Tests', command: 'cd frontend && npm test', duration: 45 },
                { name: 'Backend Tests', command: 'cd backend && npm test', duration: 60 },
                { name: 'Integration Tests', command: 'npm run test:e2e', duration: 90 },
                { name: 'Build Frontend', command: 'cd frontend && npm run build', duration: 60 },
                { name: 'Build Backend', command: 'cd backend && npm run build', duration: 45 },
                { name: 'Deploy Full Stack', command: 'npm run deploy:all', duration: 90 }
            ],
            triggers: ['push to main', 'manual', 'schedule'],
            environment: 'production',
            enabled: true
        });

        // Security Pipeline
        this.pipelines.set('security', {
            name: 'Security Scan & Audit',
            stages: [
                { name: 'Dependency Check', command: 'npm audit', duration: 30 },
                { name: 'Security Linting', command: 'npm run security:lint', duration: 20 },
                { name: 'Vulnerability Scan', command: 'npm run security:scan', duration: 45 },
                { name: 'Generate Report', command: 'npm run security:report', duration: 15 }
            ],
            triggers: ['push to main', 'manual', 'schedule'],
            environment: 'security',
            enabled: true
        });
    }

    // 🎯 Setup Event Listeners
    setupEventListeners() {
        // Auto-trigger on file changes
        document.addEventListener('file-saved', (e) => {
            if (this.ide.settings?.autoPipeline) {
                this.checkAutoTrigger(e.detail.file);
            }
        });

        // Git integration triggers
        if (this.ide.git) {
            this.ide.git.on('push', (branch) => {
                if (branch === 'main') {
                    this.runPipeline('frontend');
                    this.runPipeline('backend');
                }
            });
        }
    }

    // 🔄 Start Pipeline Monitoring
    startPipelineMonitoring() {
        // Check pipeline status every 30 seconds
        setInterval(() => {
            this.updatePipelineStatus();
        }, 30000);
    }

    // 🚀 Run Pipeline
    async runPipeline(pipelineId, options = {}) {
        const pipeline = this.pipelines.get(pipelineId);
        if (!pipeline || !pipeline.enabled) {
            this.ide.addChatMessage(`❌ Pipeline ${pipelineId} not found or disabled`, 'CI/CD', 'system');
            return;
        }

        this.currentPipeline = {
            ...pipeline,
            id: pipelineId,
            startTime: new Date().toISOString(),
            status: 'running',
            currentStage: 0,
            stages: pipeline.stages.map(stage => ({
                ...stage,
                status: 'pending',
                startTime: null,
                endTime: null,
                output: []
            }))
        };

        this.ide.addChatMessage(
            `🚀 Starting pipeline: ${pipeline.name}\n📋 Stages: ${pipeline.stages.length}\n⏱️ Estimated time: ${this.calculateTotalDuration(pipeline)}s`,
            'CI/CD',
            'system'
        );

        // Execute stages sequentially
        await this.executePipelineStages(this.currentPipeline);
    }

    // ⚡ Execute Pipeline Stages
    async executePipelineStages(pipeline) {
        for (let i = 0; i < pipeline.stages.length; i++) {
            const stage = pipeline.stages[i];
            pipeline.currentStage = i;
            
            // Update stage status
            stage.status = 'running';
            stage.startTime = new Date().toISOString();
            
            this.ide.addChatMessage(
                `⚡ Executing: ${stage.name}\n💻 Command: ${stage.command}\n⏱️ Duration: ${stage.duration}s`,
                'CI/CD',
                'system'
            );

            // Simulate stage execution
            await this.executeStage(stage);

            // Check if stage succeeded
            if (stage.status === 'failed') {
                pipeline.status = 'failed';
                this.ide.addChatMessage(
                    `❌ Pipeline failed at stage: ${stage.name}\n🔍 Check logs for details`,
                    'CI/CD',
                    'system'
                );
                return;
            }

            stage.status = 'completed';
            stage.endTime = new Date().toISOString();
            
            this.ide.addChatMessage(
                `✅ Stage completed: ${stage.name}\n⏱️ Duration: ${this.getStageDuration(stage)}s`,
                'CI/CD',
                'system'
            );
        }

        // Pipeline completed successfully
        pipeline.status = 'completed';
        pipeline.endTime = new Date().toISOString();
        
        this.ide.addChatMessage(
            `🎉 Pipeline completed successfully!\n⏱️ Total duration: ${this.getPipelineDuration(pipeline)}s\n🚀 Ready for deployment`,
            'CI/CD',
            'system'
        );

        // Add to build history
        this.buildHistory.push({ ...pipeline });
        this.saveBuildHistory();
    }

    // ⚡ Execute Stage
    async executeStage(stage) {
        // Simulate command execution
        const outputs = [
            'Installing dependencies...',
            'Running tests...',
            'Building application...',
            'Deploying to server...',
            'Security scanning...'
        ];

        // Add some output to make it realistic
        for (let i = 0; i < 3; i++) {
            stage.output.push(outputs[Math.floor(Math.random() * outputs.length)]);
            await this.sleep(stage.duration / 3);
        }

        // Random failure (5% chance)
        if (Math.random() < 0.05) {
            stage.status = 'failed';
            stage.output.push('❌ Error: Command failed');
            return;
        }

        stage.output.push('✅ Command completed successfully');
    }

    // 📊 Calculate Total Duration
    calculateTotalDuration(pipeline) {
        return pipeline.stages.reduce((total, stage) => total + stage.duration, 0);
    }

    // ⏱️ Get Stage Duration
    getStageDuration(stage) {
        if (stage.startTime && stage.endTime) {
            const start = new Date(stage.startTime);
            const end = new Date(stage.endTime);
            return Math.round((end - start) / 1000);
        }
        return stage.duration;
    }

    // ⏱️ Get Pipeline Duration
    getPipelineDuration(pipeline) {
        if (pipeline.startTime && pipeline.endTime) {
            const start = new Date(pipeline.startTime);
            const end = new Date(pipeline.endTime);
            return Math.round((end - start) / 1000);
        }
        return this.calculateTotalDuration(pipeline);
    }

    // 📋 Get Pipeline Status
    getPipelineStatus() {
        let status = '🔄 CI/CD Pipeline Status:\n\n';
        
        this.pipelines.forEach((pipeline, id) => {
            const icon = pipeline.enabled ? '✅' : '❌';
            status += `${icon} ${pipeline.name}\n`;
            status += `   📋 Stages: ${pipeline.stages.length}\n`;
            status += `   🎯 Triggers: ${pipeline.triggers.join(', ')}\n`;
            status += `   🌍 Environment: ${pipeline.environment}\n\n`;
        });

        if (this.currentPipeline) {
            status += `🚀 Currently Running: ${this.currentPipeline.name}\n`;
            status += `⚡ Stage: ${this.currentPipeline.stages[this.currentPipeline.currentStage]?.name || 'Completed'}\n`;
            status += `⏱️ Duration: ${this.getPipelineDuration(this.currentPipeline)}s\n`;
        }

        return status;
    }

    // 🔄 Update Pipeline Status
    updatePipelineStatus() {
        // Update UI elements if they exist
        const statusElement = document.querySelector('.pipeline-status');
        if (statusElement) {
            statusElement.innerHTML = this.getPipelineStatus();
        }
    }

    // 🔍 Check Auto Trigger
    checkAutoTrigger(file) {
        // Determine which pipeline to trigger based on file changes
        if (file.startsWith('frontend/')) {
            this.runPipeline('frontend');
        } else if (file.startsWith('backend/')) {
            this.runPipeline('backend');
        } else {
            this.runPipeline('fullstack');
        }
    }

    // 📊 Get Build History
    getBuildHistory() {
        return this.buildHistory.slice(-10); // Last 10 builds
    }

    // 💾 Save Build History
    saveBuildHistory() {
        localStorage.setItem('buildHistory', JSON.stringify(this.buildHistory));
    }

    // 📥 Load Build History
    loadBuildHistory() {
        const saved = localStorage.getItem('buildHistory');
        if (saved) {
            this.buildHistory = JSON.parse(saved);
        }
    }

    // 🎛️ Create Pipeline UI
    createPipelineUI() {
        const pipelinePanel = document.createElement('div');
        pipelinePanel.id = 'pipeline-panel';
        pipelinePanel.className = 'panel-section hidden';
        pipelinePanel.innerHTML = `
            <div class="panel-header">
                <h3>🔄 CI/CD Pipeline</h3>
            </div>
            <div class="pipeline-controls">
                <div class="pipeline-selector">
                    <label>Select Pipeline:</label>
                    <select id="pipeline-select" class="bg-tertiary border border-border-color rounded p-1">
                        ${Array.from(this.pipelines.entries()).map(([id, pipeline]) => 
                            `<option value="${id}">${pipeline.name}</option>`
                        ).join('')}
                    </select>
                </div>
                <div class="pipeline-actions">
                    <button class="btn" onclick="ide.pipeline.runPipeline(document.getElementById('pipeline-select').value)">
                        <i data-lucide="play" class="w-4 h-4"></i> Run Pipeline
                    </button>
                    <button class="btn btn-secondary" onclick="ide.pipeline.showPipelineStatus()">
                        <i data-lucide="info" class="w-4 h-4"></i> Status
                    </button>
                    <button class="btn btn-secondary" onclick="ide.pipeline.showBuildHistory()">
                        <i data-lucide="history" class="w-4 h-4"></i> History
                    </button>
                </div>
            </div>
            <div class="pipeline-output" id="pipeline-output">
                <!-- Pipeline output will be displayed here -->
            </div>
        `;

        // Add to bottom panel
        const bottomPanel = document.querySelector('.bottom-panel .panel-content');
        if (bottomPanel) {
            bottomPanel.appendChild(pipelinePanel);
        }
    }

    // 📊 Show Pipeline Status
    showPipelineStatus() {
        const status = this.getPipelineStatus();
        this.ide.addChatMessage(status, 'CI/CD Status', 'system');
    }

    // 📋 Show Build History
    showBuildHistory() {
        const history = this.getBuildHistory();
        let message = '📋 Build History:\n\n';
        
        history.forEach((build, index) => {
            const icon = build.status === 'completed' ? '✅' : '❌';
            const date = new Date(build.startTime).toLocaleString();
            message += `${icon} ${build.name} - ${date}\n`;
            message += `   ⏱️ Duration: ${this.getPipelineDuration(build)}s\n`;
            message += `   📊 Status: ${build.status}\n\n`;
        });

        if (history.length === 0) {
            message = '📋 No build history available';
        }

        this.ide.addChatMessage(message, 'Build History', 'system');
    }

    // ⚙️ Configure Pipeline
    configurePipeline(pipelineId, config) {
        const pipeline = this.pipelines.get(pipelineId);
        if (pipeline) {
            Object.assign(pipeline, config);
            this.ide.addChatMessage(`⚙️ Pipeline ${pipelineId} configured`, 'CI/CD', 'system');
        }
    }

    // 🔧 Enable/Disable Pipeline
    togglePipeline(pipelineId) {
        const pipeline = this.pipelines.get(pipelineId);
        if (pipeline) {
            pipeline.enabled = !pipeline.enabled;
            const status = pipeline.enabled ? 'enabled' : 'disabled';
            this.ide.addChatMessage(`${pipeline.name} ${status}`, 'CI/CD', 'system');
        }
    }

    // 😴 Utility function for delays
    sleep(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    // 🎯 Get Pipeline Metrics
    getMetrics() {
        const totalPipelines = this.pipelines.size;
        const enabledPipelines = Array.from(this.pipelines.values()).filter(p => p.enabled).length;
        const totalBuilds = this.buildHistory.length;
        const successfulBuilds = this.buildHistory.filter(b => b.status === 'completed').length;
        const successRate = totalBuilds > 0 ? (successfulBuilds / totalBuilds * 100).toFixed(1) : 0;

        return {
            totalPipelines,
            enabledPipelines,
            totalBuilds,
            successfulBuilds,
            successRate: `${successRate}%`,
            currentlyRunning: this.currentPipeline ? this.currentPipeline.name : 'None'
        };
    }
}

// Export for use in IDE
window.CICDPipeline = CICDPipeline;
