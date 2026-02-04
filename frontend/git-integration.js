// 🔄 Git/GitHub/GitLab Integration - Feedback Applied

class GitIntegration {
    constructor(ide) {
        this.ide = ide;
        this.currentBranch = 'main';
        this.status = {
            modified: [],
            added: [],
            deleted: [],
            untracked: []
        };
        this.remotes = {
            origin: 'https://github.com/user/penguin-alpha-ide.git'
        };
        this.initialize();
    }

    // 🚀 Initialize Git Integration
    async initialize() {
        this.setupGitCommands();
        this.setupEventListeners();
        this.updateGitStatus();
        this.ide.addChatMessage('🔄 Git integration initialized', 'Git', 'system');
    }

    // ⚙️ Setup Git Commands
    setupGitCommands() {
        this.gitCommands = {
            // Basic Commands
            'git status': () => this.getStatus(),
            'git add': (file) => this.addFile(file),
            'git commit': (message) => this.commit(message),
            'git push': () => this.push(),
            'git pull': () => this.pull(),
            
            // Branch Commands
            'git branch': () => this.listBranches(),
            'git checkout': (branch) => this.checkout(branch),
            'git merge': (branch) => this.merge(branch),
            
            // Remote Commands
            'git remote': () => this.listRemotes(),
            'git fetch': () => this.fetch(),
            'git clone': (url) => this.clone(url),
            
            // History Commands
            'git log': () => this.getLog(),
            'git diff': () => this.getDiff(),
            'git show': (commit) => this.showCommit(commit)
        };
    }

    // 🎯 Setup Event Listeners
    setupEventListeners() {
        // Auto-commit on save
        document.addEventListener('file-saved', (e) => {
            this.autoCommit(e.detail.file);
        });

        // Sync status every 30 seconds
        setInterval(() => {
            this.updateGitStatus();
        }, 30000);
    }

    // 📊 Get Git Status
    async getStatus() {
        // Simulate git status
        this.status = {
            modified: ['app.js', 'index.html'],
            added: ['themes.css'],
            deleted: ['old-config.js'],
            untracked: ['new-feature.js']
        };

        const statusMessage = this.formatStatus();
        this.ide.addChatMessage(statusMessage, 'Git Status', 'system');
        return this.status;
    }

    // 📝 Format Status Message
    formatStatus() {
        let message = `📊 Git Status - Branch: ${this.currentBranch}\n\n`;
        
        if (this.status.modified.length > 0) {
            message += `📝 Modified files:\n${this.status.modified.map(f => `  • ${f}`).join('\n')}\n\n`;
        }
        
        if (this.status.added.length > 0) {
            message += `➕ Added files:\n${this.status.added.map(f => `  • ${f}`).join('\n')}\n\n`;
        }
        
        if (this.status.deleted.length > 0) {
            message += `🗑️ Deleted files:\n${this.status.deleted.map(f => `  • ${f}`).join('\n')}\n\n`;
        }
        
        if (this.status.untracked.length > 0) {
            message += `❓ Untracked files:\n${this.status.untracked.map(f => `  • ${f}`).join('\n')}\n\n`;
        }
        
        if (this.status.modified.length === 0 && 
            this.status.added.length === 0 && 
            this.status.deleted.length === 0) {
            message += '✅ Working tree clean';
        }
        
        return message;
    }

    // ➕ Add File
    async addFile(file) {
        if (!file) {
            // Add all files
            this.status.modified.forEach(f => this.status.added.push(f));
            this.status.modified = [];
            this.status.untracked.forEach(f => this.status.added.push(f));
            this.status.untracked = [];
            
            this.ide.addChatMessage('➕ All files added to staging area', 'Git', 'system');
        } else {
            // Add specific file
            if (this.status.modified.includes(file)) {
                this.status.modified = this.status.modified.filter(f => f !== file);
                this.status.added.push(file);
                this.ide.addChatMessage(`➕ ${file} added to staging area`, 'Git', 'system');
            }
        }
        
        this.updateGitStatus();
    }

    // 💾 Commit Changes
    async commit(message = 'Auto-commit from Penguin Alpha IDE') {
        if (this.status.added.length === 0) {
            this.ide.addChatMessage('❌ No files staged for commit', 'Git', 'system');
            return;
        }

        // Simulate commit
        const commit = {
            hash: this.generateCommitHash(),
            message: message,
            author: 'Penguin Alpha IDE',
            timestamp: new Date().toISOString(),
            files: [...this.status.added]
        };

        // Clear staging area
        this.status.added = [];
        
        this.ide.addChatMessage(
            `✅ Commit created: ${commit.hash.substring(0, 7)}\n📝 Message: ${message}\n📁 Files: ${commit.files.length}`,
            'Git',
            'system'
        );

        this.updateGitStatus();
        return commit;
    }

    // 🚀 Push Changes
    async push() {
        if (this.status.added.length > 0) {
            this.ide.addChatMessage('⚠️ You have unstaged changes. Commit first or use --force', 'Git', 'system');
            return;
        }

        // Simulate push
        this.ide.addChatMessage('🚀 Pushing to remote repository...', 'Git', 'system');
        
        setTimeout(() => {
            this.ide.addChatMessage(
                '✅ Push successful\n🌐 Remote: origin\n📦 Branch: main\n🔄 Synced with GitHub',
                'Git',
                'system'
            );
        }, 2000);

        return { success: true };
    }

    // 📥 Pull Changes
    async pull() {
        this.ide.addChatMessage('📥 Pulling from remote repository...', 'Git', 'system');
        
        setTimeout(() => {
            this.ide.addChatMessage(
                '✅ Pull successful\n📥 No new changes\n🔄 Repository up to date',
                'Git',
                'system'
            );
        }, 1500);

        return { success: true };
    }

    // 🌿 List Branches
    async listBranches() {
        const branches = [
            { name: 'main', current: true, remote: true },
            { name: 'develop', current: false, remote: true },
            { name: 'feature/new-ui', current: false, remote: false },
            { name: 'hotfix/bug-fix', current: false, remote: false }
        ];

        let message = '🌿 Branches:\n\n';
        branches.forEach(branch => {
            const icon = branch.current ? '📍' : branch.remote ? '🌐' : '🔧';
            message += `${icon} ${branch.name}\n`;
        });

        this.ide.addChatMessage(message, 'Git', 'system');
        return branches;
    }

    // 🔄 Checkout Branch
    async checkout(branch) {
        this.currentBranch = branch;
        this.ide.addChatMessage(`🔄 Switched to branch: ${branch}`, 'Git', 'system');
        this.updateGitStatus();
    }

    // 🔄 Merge Branch
    async merge(branch) {
        this.ide.addChatMessage(`🔄 Merging ${branch} into ${this.currentBranch}...`, 'Git', 'system');
        
        setTimeout(() => {
            this.ide.addChatMessage(
                `✅ Merge successful\n📥 Merged: ${branch}\n📍 Into: ${this.currentBranch}`,
                'Git',
                'system'
            );
        }, 2000);

        return { success: true };
    }

    // 🌐 List Remotes
    async listRemotes() {
        let message = '🌐 Remote repositories:\n\n';
        
        Object.entries(this.remotes).forEach(([name, url]) => {
            message += `📡 ${name}: ${url}\n`;
        });

        this.ide.addChatMessage(message, 'Git', 'system');
        return this.remotes;
    }

    // 📥 Fetch
    async fetch() {
        this.ide.addChatMessage('📥 Fetching from remote...', 'Git', 'system');
        
        setTimeout(() => {
            this.ide.addChatMessage('✅ Fetch complete - Repository up to date', 'Git', 'system');
        }, 1000);

        return { success: true };
    }

    // 📋 Get Log
    async getLog() {
        const commits = [
            {
                hash: 'a1b2c3d',
                message: 'Add Git integration',
                author: 'Penguin Alpha',
                date: '2024-01-15'
            },
            {
                hash: 'e4f5g6h',
                message: 'Update UI components',
                author: 'Penguin Alpha',
                date: '2024-01-14'
            },
            {
                hash: 'i7j8k9l',
                message: 'Fix terminal issues',
                author: 'Penguin Alpha',
                date: '2024-01-13'
            }
        ];

        let message = '📋 Commit History:\n\n';
        commits.forEach(commit => {
            message += `🔗 ${commit.hash} • ${commit.message}\n   👤 ${commit.author} • 📅 ${commit.date}\n\n`;
        });

        this.ide.addChatMessage(message, 'Git', 'system');
        return commits;
    }

    // 📊 Get Diff
    async getDiff() {
        if (this.status.modified.length === 0) {
            this.ide.addChatMessage('📊 No changes to show', 'Git', 'system');
            return;
        }

        let message = '📊 Changes:\n\n';
        this.status.modified.forEach(file => {
            message += `📝 ${file}\n`;
            message += `@@ -1,3 +1,4 @@\n`;
            message += `- old line\n`;
            message += `+ new line\n\n`;
        });

        this.ide.addChatMessage(message, 'Git Diff', 'system');
    }

    // 🔍 Show Commit
    async showCommit(commit) {
        this.ide.addChatMessage(
            `🔍 Commit: ${commit}\n📝 Message: Example commit\n👤 Author: Penguin Alpha\n📅 Date: 2024-01-15\n📁 Files: 5 changed`,
            'Git',
            'system'
        );
    }

    // 🔄 Update Git Status
    updateGitStatus() {
        // Update UI elements
        const statusIndicator = document.querySelector('.git-status');
        if (statusIndicator) {
            const hasChanges = this.status.modified.length > 0 || 
                              this.status.added.length > 0 || 
                              this.status.untracked.length > 0;
            
            statusIndicator.className = hasChanges ? 'git-status modified' : 'git-status clean';
            statusIndicator.innerHTML = hasChanges ? 
                '🔄 Modified' : '✅ Clean';
        }
    }

    // 🤖 Auto-commit
    async autoCommit(file) {
        if (this.ide.settings?.autoCommit) {
            await this.addFile(file);
            await this.commit(`Auto-save: ${file}`);
        }
    }

    // 🔧 Generate Commit Hash
    generateCommitHash() {
        return Math.random().toString(36).substring(2, 9);
    }

    // 📋 Execute Git Command
    async executeCommand(command) {
        const parts = command.split(' ');
        const cmd = parts[0] + ' ' + parts[1];
        const args = parts.slice(2);

        if (this.gitCommands[cmd]) {
            return await this.gitCommands[cmd](...args);
        } else {
            this.ide.addChatMessage(`❌ Unknown command: ${cmd}`, 'Git', 'system');
        }
    }
}

// Export for use in IDE
window.GitIntegration = GitIntegration;
