// 🛍️ Extension Marketplace - Feedback Applied

class ExtensionMarketplace {
    constructor(ide) {
        this.ide = ide;
        this.installedExtensions = new Map();
        this.availableExtensions = [];
        this.categories = ['Development', 'Themes', 'Productivity', 'AI', 'Debugging', 'Git', 'Agents', 'Tools', 'Protocols', 'Integrations'];
        this.initialize();
    }

    // 🚀 Initialize Marketplace
    async initialize() {
        await this.loadAvailableExtensions();
        this.loadInstalledExtensions();
        this.setupMarketplaceUI();
        this.ide.addChatMessage('🛍️ Extension Marketplace initialized', 'Marketplace', 'system');
    }

    // 📦 Load Available Extensions
    async loadAvailableExtensions() {
        const fallback = [
            // Development Extensions
            {
                id: 'prettier',
                name: 'Prettier - Code Formatter',
                description: 'Format your code with Prettier',
                category: 'Development',
                author: 'Prettier Team',
                version: '3.0.0',
                rating: 4.8,
                downloads: 12500000,
                price: 'Free',
                icon: 'sparkles',
                tags: ['formatting', 'code-style', 'javascript', 'typescript'],
                features: ['Auto-format on save', 'Custom rules', 'Multi-language support']
            },
            {
                id: 'eslint',
                name: 'ESLint - JavaScript Linter',
                description: 'Find and fix problems in your JavaScript code',
                category: 'Development',
                author: 'ESLint Team',
                version: '8.0.0',
                rating: 4.7,
                downloads: 20000000,
                price: 'Free',
                icon: 'shield-check',
                tags: ['linting', 'javascript', 'code-quality', 'eslint'],
                features: ['Real-time linting', 'Auto-fix', 'Custom rules', 'Integrations']
            },
            {
                id: 'live-server',
                name: 'Live Server',
                description: 'Launch a development local server with live reload',
                category: 'Development',
                author: 'Ritwick Dey',
                version: '5.7.0',
                rating: 4.6,
                downloads: 18000000,
                price: 'Free',
                icon: 'server',
                tags: ['server', 'live-reload', 'development', 'web'],
                features: ['Live reload', 'HTTPS support', 'Proxy configuration', 'Custom port']
            },

            // Theme Extensions
            {
                id: 'dracula-theme',
                name: 'Dracula Theme',
                description: 'Official Dracula theme for VS Code',
                category: 'Themes',
                author: 'Dracula Theme',
                version: '2.3.0',
                rating: 4.9,
                downloads: 8500000,
                price: 'Free',
                icon: 'palette',
                tags: ['theme', 'dark', 'dracula', 'colors'],
                features: ['Dark theme', 'Syntax highlighting', 'Multiple languages', 'Custom colors']
            },
            {
                id: 'material-theme',
                name: 'Material Theme',
                description: 'Material Design inspired theme',
                category: 'Themes',
                author: 'Mattia Astorino',
                version: '3.2.0',
                rating: 4.8,
                downloads: 12000000,
                price: 'Free',
                icon: 'brush',
                tags: ['theme', 'material', 'design', 'colors'],
                features: ['Material Design', 'Multiple variants', 'Customizable', 'High contrast']
            },

            // Productivity Extensions
            {
                id: 'gitlens',
                name: 'GitLens - Git supercharged',
                description: 'Supercharge the Git capabilities built into VS Code',
                category: 'Productivity',
                author: 'GitKraken',
                version: '14.0.0',
                rating: 4.9,
                downloads: 25000000,
                price: 'Free',
                icon: 'git-branch',
                tags: ['git', 'productivity', 'version-control', 'collaboration'],
                features: ['Git blame', 'Code lens', 'Repository visualization', 'History']
            },
            {
                id: 'todo-tree',
                name: 'Todo Tree',
                description: 'Show TODOs in a tree view',
                category: 'Productivity',
                author: 'Gruntfuggly',
                version: '0.22.0',
                rating: 4.5,
                downloads: 5500000,
                price: 'Free',
                icon: 'check-square',
                tags: ['todo', 'task-management', 'productivity', 'organization'],
                features: ['TODO highlighting', 'Tree view', 'Custom tags', 'Filtering']
            },

            // AI Extensions
            {
                id: 'copilot-labs',
                name: 'GitHub Copilot Labs',
                description: 'Experimental AI features for Copilot',
                category: 'AI',
                author: 'GitHub',
                version: '1.0.0',
                rating: 4.3,
                downloads: 3200000,
                price: 'Free',
                icon: 'cpu',
                tags: ['ai', 'copilot', 'code-generation', 'experimental'],
                features: ['Code explanation', 'Test generation', 'Code walkthroughs', 'AI assistance']
            },
            {
                id: 'codeium',
                name: 'Codeium',
                description: 'Free AI-powered autocomplete',
                category: 'AI',
                author: 'Codeium',
                version: '1.2.0',
                rating: 4.4,
                downloads: 1800000,
                price: 'Free',
                icon: 'zap',
                tags: ['ai', 'autocomplete', 'code-completion', 'free'],
                features: ['AI autocomplete', 'Multi-language', 'Free tier', 'Fast suggestions']
            },

            // Debugging Extensions
            {
                id: 'debugger-for-chrome',
                name: 'Debugger for Chrome',
                description: 'Debug your JavaScript code in the Chrome browser',
                category: 'Debugging',
                author: 'Microsoft',
                version: '4.12.0',
                rating: 4.2,
                downloads: 8900000,
                price: 'Free',
                icon: 'bug',
                tags: ['debugging', 'chrome', 'javascript', 'browser'],
                features: ['Chrome debugging', 'Breakpoints', 'Call stack', 'Variable inspection']
            },
            {
                id: 'python-debugger',
                name: 'Python Debugger',
                description: 'Debug Python code in VS Code',
                category: 'Debugging',
                author: 'Microsoft',
                version: '2024.0.0',
                rating: 4.6,
                downloads: 15000000,
                price: 'Free',
                icon: 'bug',
                tags: ['debugging', 'python', 'development', 'ide'],
                features: ['Python debugging', 'Breakpoints', 'Variable explorer', 'Remote debugging']
            },

            // Agent Extensions (monetizable)
            {
                id: 'debug-agent',
                name: 'Debug Agent Pro',
                description: 'Detects errors, suggests fixes, and generates tests.',
                category: 'Agents',
                author: 'ISEN',
                version: '1.0.0',
                rating: 4.9,
                downloads: 1200,
                price: '$9/mo',
                icon: 'bug',
                tags: ['agent', 'debug', 'tests', 'ai'],
                features: ['Auto error scan', 'Fix suggestions', 'Test scaffolding']
            },
            {
                id: 'frontend-agent',
                name: 'Frontend Agent',
                description: 'Generates UI components and refactors styles.',
                category: 'Agents',
                author: 'ISEN',
                version: '1.0.0',
                rating: 4.8,
                downloads: 980,
                price: '$12/mo',
                icon: 'layout',
                tags: ['agent', 'frontend', 'ui', 'components'],
                features: ['Component generator', 'Theme refactor', 'Layout suggestions']
            },
            {
                id: 'devops-agent',
                name: 'DevOps Agent',
                description: 'CI/CD templates, deploy scripts, and status checks.',
                category: 'Agents',
                author: 'ISEN',
                version: '1.0.0',
                rating: 4.7,
                downloads: 650,
                price: '$15/mo',
                icon: 'rocket',
                tags: ['agent', 'devops', 'cicd', 'deploy'],
                features: ['Pipeline generator', 'Deploy checklists', 'Infra tips']
            },
            {
                id: 'quantum-agent',
                name: 'Quantum Agent',
                description: 'Quantum reasoning, superposition, and prediction.',
                category: 'Agents',
                author: 'ISEN',
                version: '1.0.0',
                rating: 4.8,
                downloads: 420,
                price: '$18/mo',
                icon: 'cpu',
                tags: ['agent', 'quantum', 'analysis'],
                features: ['Quantum reasoning', 'Superposition analysis', 'Probabilistic prediction']
            },
            {
                id: 'spatial-agent',
                name: 'Spatial Agent',
                description: '3D mapping, holography, and spatial insights.',
                category: 'Agents',
                author: 'ISEN',
                version: '1.0.0',
                rating: 4.7,
                downloads: 310,
                price: '$14/mo',
                icon: 'layout',
                tags: ['agent', 'spatial', 'visualization'],
                features: ['3D mapping', 'Holographic projection', 'Spatial visualization']
            },
            {
                id: 'alchemical-agent',
                name: 'Alchemical Agent',
                description: 'Transmutation workflows and symbolic rituals.',
                category: 'Agents',
                author: 'ISEN',
                version: '1.0.0',
                rating: 4.6,
                downloads: 260,
                price: '$16/mo',
                icon: 'sparkles',
                tags: ['agent', 'alchemy', 'rituals'],
                features: ['Transmutation process', 'Ritual design', 'Symbol generator']
            },
            {
                id: 'terra-agent',
                name: 'Terra Agent',
                description: 'Collective awareness and planetary alignment.',
                category: 'Agents',
                author: 'ISEN',
                version: '1.0.0',
                rating: 4.7,
                downloads: 280,
                price: '$20/mo',
                icon: 'globe',
                tags: ['agent', 'terra', 'consciousness'],
                features: ['Gaia sync', 'Collective alignment', 'Impact guidance']
            },
            {
                id: 'self-dev-agent',
                name: 'Self Dev Agent',
                description: 'Project scanning, readiness scoring, and planning.',
                category: 'Agents',
                author: 'ISEN',
                version: '1.0.0',
                rating: 4.9,
                downloads: 540,
                price: '$25/mo',
                icon: 'brain',
                tags: ['agent', 'planning', 'audit'],
                features: ['Project scan', 'Readiness scoring', 'Roadmap planning']
            },
            {
                id: 'fractal-designer',
                name: 'Fractal Designer',
                description: 'Generate fractal patterns and templates.',
                category: 'Tools',
                author: 'ISEN',
                version: '1.0.0',
                rating: 4.5,
                downloads: 180,
                price: '$6/mo',
                icon: 'eye',
                tags: ['tool', 'fractal', 'design'],
                features: ['Pattern generator', 'Export presets', 'Style variants']
            },
            {
                id: 'neural-synth',
                name: 'Neural Synth',
                description: 'Design neural networks and ML blueprints.',
                category: 'Tools',
                author: 'ISEN',
                version: '1.0.0',
                rating: 4.6,
                downloads: 210,
                price: '$12/mo',
                icon: 'zap',
                tags: ['tool', 'ml', 'neural'],
                features: ['Network designer', 'Layer presets', 'Complexity tuning']
            },
            {
                id: 'holographic-renderer',
                name: 'Holographic Renderer',
                description: 'Render holographic scenes and visuals.',
                category: 'Tools',
                author: 'ISEN',
                version: '1.0.0',
                rating: 4.4,
                downloads: 160,
                price: '$10/mo',
                icon: 'image',
                tags: ['tool', 'render', 'visual'],
                features: ['Volumetric renderer', 'Layer control', 'Scene presets']
            }
        ];

        this.fallbackExtensions = fallback;
        try {
            const res = await fetch(this.ide.apiUrl('/api/marketplace/extensions'));
            if (res.ok) {
                const data = await res.json();
                this.availableExtensions = this.mergeExtensions(data, fallback);
                return;
            }
        } catch (error) {
            // fallback to local catalog
        }
        this.availableExtensions = fallback;
    }

    mergeExtensions(remote, fallback) {
        const fallbackMap = new Map(fallback.map(entry => [entry.id, entry]));
        const merged = [];
        if (Array.isArray(remote) && remote.length) {
            remote.forEach(entry => {
                const base = fallbackMap.get(entry.id) || {};
                const category = entry.category || base.category || this.guessCategory(entry.id);
                merged.push({
                    ...base,
                    ...entry,
                    category,
                    author: entry.author || base.author || 'ISEN',
                    version: entry.version || base.version || '1.0.0',
                    rating: entry.rating || base.rating || 4.5,
                    downloads: entry.downloads || base.downloads || 0,
                    icon: entry.icon || base.icon || 'cpu',
                    tags: entry.tags || base.tags || [category.toLowerCase()],
                    features: entry.features || base.features || []
                });
            });
        }
        fallback.forEach(entry => {
            if (!merged.some(item => item.id === entry.id)) {
                merged.push(entry);
            }
        });
        return merged;
    }

    guessCategory(id) {
        const value = String(id || '').toLowerCase();
        if (value.includes('agent')) return 'Agents';
        if (value.includes('protocol')) return 'Protocols';
        if (value.includes('bridge') || value.includes('integration')) return 'Integrations';
        return 'Tools';
    }

    // 📦 Load Installed Extensions
    loadInstalledExtensions() {
        // Load from localStorage or default
        const installed = localStorage.getItem('installedExtensions');
        if (installed) {
            const installedIds = JSON.parse(installed);
            installedIds.forEach(id => {
                const extension = this.availableExtensions.find(ext => ext.id === id);
                if (extension) {
                    this.installedExtensions.set(id, { ...extension, installed: true });
                }
            });
        }
    }

    // 🎨 Setup Marketplace UI
    setupMarketplaceUI() {
        this.createMarketplaceModal();
        this.createExtensionCards();
        this.setupFilters();
        this.setupSearch();
    }

    // 🏪 Create Marketplace Modal
    createMarketplaceModal() {
        const modal = document.createElement('div');
        modal.id = 'marketplace-modal';
        modal.className = 'modal hidden';
        modal.innerHTML = `
            <div class="modal-content marketplace-content">
                <div class="modal-header">
                    <h2 class="modal-title">🛍️ Extension Marketplace</h2>
                    <div class="modal-close" onclick="ide.marketplace.closeMarketplace()">
                        <i data-lucide="x" class="w-4 h-4"></i>
                    </div>
                </div>
                
                <div class="marketplace-body">
                    <div class="marketplace-sidebar">
                        <div class="marketplace-search">
                            <input type="text" id="extension-search" placeholder="Search extensions..." 
                                   class="w-full p-2 bg-tertiary border border-border-color rounded">
                        </div>
                        
                        <div class="marketplace-categories">
                            <h3>Categories</h3>
                            <div class="category-list">
                                <div class="category-item active" data-category="all">All Extensions</div>
                                ${this.categories.map(cat => 
                                    `<div class="category-item" data-category="${cat.toLowerCase()}">${cat}</div>`
                                ).join('')}
                            </div>
                        </div>
                        
                        <div class="marketplace-filters">
                            <h3>Filters</h3>
                            <div class="filter-group">
                                <label>
                                    <input type="checkbox" id="free-only" checked> Free only
                                </label>
                                <label>
                                    <input type="checkbox" id="installed-only"> Installed only
                                </label>
                            </div>
                        </div>
                    </div>
                    
                    <div class="marketplace-main">
                        <div class="marketplace-header">
                            <div class="sort-options">
                                <select id="sort-by" class="bg-tertiary border border-border-color rounded p-1">
                                    <option value="downloads">Most Downloads</option>
                                    <option value="rating">Highest Rated</option>
                                    <option value="name">Name</option>
                                    <option value="updated">Recently Updated</option>
                                </select>
                            </div>
                        </div>
                        
                        <div id="extension-grid" class="extension-grid">
                            <!-- Extension cards will be inserted here -->
                        </div>
                    </div>
                </div>
            </div>
        `;
        
        document.body.appendChild(modal);
    }

    // 🎴 Create Extension Cards
    createExtensionCards() {
        const grid = document.getElementById('extension-grid');
        if (!grid) return;

        grid.innerHTML = '';
        const extensions = this.getFilteredExtensions();

        extensions.forEach(extension => {
            const card = this.createExtensionCard(extension);
            grid.appendChild(card);
        });
        this.ide.safeCreateIcons();
    }

    // 🎴 Create Extension Card
    createExtensionCard(extension) {
        const card = document.createElement('div');
        card.className = 'extension-card';
        card.dataset.extensionId = extension.id;

        const isInstalled = this.installedExtensions.has(extension.id);
        const canOpen = isInstalled && this.ide.extensionHost && this.ide.extensionHost.registry && this.ide.extensionHost.registry.has(extension.id);

        card.innerHTML = `
            <div class="extension-header">
                <div class="extension-icon">
                    <i data-lucide="${extension.icon}" class="w-6 h-6"></i>
                </div>
                <div class="extension-info">
                    <h3 class="extension-name">${extension.name}</h3>
                    <p class="extension-author">by ${extension.author}</p>
                </div>
                <div class="extension-rating">
                    ⭐ ${extension.rating}
                </div>
            </div>
            
            <div class="extension-description">
                <p>${extension.description}</p>
            </div>
            
            <div class="extension-meta">
                <span class="extension-downloads">📥 ${this.formatDownloads(extension.downloads)}</span>
                <span class="extension-price">${extension.price}</span>
                <span class="extension-version">v${extension.version}</span>
            </div>
            
            <div class="extension-tags">
                ${extension.tags.map(tag => `<span class="tag">${tag}</span>`).join('')}
            </div>
            
            <div class="extension-actions">
                ${isInstalled ? 
                    `<button class="btn btn-secondary" onclick="ide.marketplace.uninstall('${extension.id}')">
                        <i data-lucide="trash-2" class="w-4 h-4"></i> Uninstall
                    </button>` :
                    `<button class="btn" onclick="ide.marketplace.install('${extension.id}')">
                        <i data-lucide="download" class="w-4 h-4"></i> Install
                    </button>`
                }
                ${canOpen ? 
                    `<button class="btn" onclick="ide.extensionHost.openPanel('${extension.id}')">
                        <i data-lucide="panel-right" class="w-4 h-4"></i> Open
                    </button>` : ''
                }
                ${extension.price !== 'Free' ? `
                    <button class="btn btn-secondary" onclick="ide.marketplace.startTrial('${extension.id}')">
                        <i data-lucide="sparkles" class="w-4 h-4"></i> Trial
                    </button>
                    <button class="btn" onclick="ide.marketplace.buy('${extension.id}')">
                        <i data-lucide="credit-card" class="w-4 h-4"></i> Buy
                    </button>
                ` : ''}
                <button class="btn btn-secondary" onclick="ide.marketplace.showDetails('${extension.id}')">
                    <i data-lucide="info" class="w-4 h-4"></i> Details
                </button>
            </div>
        `;

        return card;
    }

    // 🔍 Get Filtered Extensions
    getFilteredExtensions() {
        let extensions = [...this.availableExtensions];

        // Category filter
        const activeCategory = document.querySelector('.category-item.active')?.dataset.category || 'all';
        if (activeCategory !== 'all') {
            extensions = extensions.filter(ext => ext.category.toLowerCase() === activeCategory);
        }

        // Search filter
        const searchTerm = document.getElementById('extension-search')?.value.toLowerCase() || '';
        if (searchTerm) {
            extensions = extensions.filter(ext => 
                ext.name.toLowerCase().includes(searchTerm) ||
                ext.description.toLowerCase().includes(searchTerm) ||
                ext.tags.some(tag => tag.toLowerCase().includes(searchTerm))
            );
        }

        // Free only filter
        if (document.getElementById('free-only')?.checked) {
            extensions = extensions.filter(ext => ext.price === 'Free');
        }

        // Installed only filter
        if (document.getElementById('installed-only')?.checked) {
            extensions = extensions.filter(ext => this.installedExtensions.has(ext.id));
        }

        // Sort
        const sortBy = document.getElementById('sort-by')?.value || 'downloads';
        extensions.sort((a, b) => {
            switch (sortBy) {
                case 'downloads': return b.downloads - a.downloads;
                case 'rating': return b.rating - a.rating;
                case 'name': return a.name.localeCompare(b.name);
                default: return 0;
            }
        });

        return extensions;
    }

    // 📦 Install Extension
    async install(extensionId) {
        const extension = this.availableExtensions.find(ext => ext.id === extensionId);
        if (!extension) return;

        this.ide.addChatMessage(`📦 Installing ${extension.name}...`, 'Marketplace', 'system');

        // Simulate installation
        setTimeout(() => {
            this.installedExtensions.set(extensionId, { ...extension, installed: true });
            this.saveInstalledExtensions();
            this.createExtensionCards();
            
            this.ide.addChatMessage(
                `✅ ${extension.name} installed successfully!\n🎯 Ready to use`,
                'Marketplace',
                'system'
            );

            if (this.ide.extensionHost && this.ide.extensionHost.registry && this.ide.extensionHost.registry.has(extensionId)) {
                this.ide.extensionHost.install(extensionId);
            }

            // Activate extension features
            this.activateExtension(extension);
        }, 2000);
    }

    // 🗑️ Uninstall Extension
    async uninstall(extensionId) {
        const extension = this.installedExtensions.get(extensionId);
        if (!extension) return;

        this.ide.addChatMessage(`🗑️ Uninstalling ${extension.name}...`, 'Marketplace', 'system');

        // Simulate uninstallation
        setTimeout(() => {
            this.installedExtensions.delete(extensionId);
            this.saveInstalledExtensions();
            this.createExtensionCards();
            
            this.ide.addChatMessage(
                `✅ ${extension.name} uninstalled successfully`,
                'Marketplace',
                'system'
            );

            // Deactivate extension features
            this.deactivateExtension(extension);
        }, 1000);
    }

    // 🔄 Activate Extension
    activateExtension(extension) {
        const canActivate = this.ide.extensionHost && this.ide.extensionHost.registry && this.ide.extensionHost.registry.has(extension.id);
        switch (extension.id) {
            case 'prettier':
                this.ide.addChatMessage('🎨 Prettier activated: Auto-format on save enabled', 'Extension', 'system');
                break;
            case 'eslint':
                this.ide.addChatMessage('🔍 ESLint activated: Real-time linting enabled', 'Extension', 'system');
                break;
            case 'live-server':
                this.ide.addChatMessage('🌐 Live Server activated: Development server ready', 'Extension', 'system');
                break;
            case 'gitlens':
                this.ide.addChatMessage('🔍 GitLens activated: Git supercharged features enabled', 'Extension', 'system');
                break;
            case 'debug-agent':
            case 'frontend-agent':
            case 'devops-agent':
                if (this.ide.extensionHost) {
                    this.ide.extensionHost.activate(extension.id);
                    this.ide.addChatMessage(`🤖 ${extension.name} activated`, 'Extension', 'system');
                }
                break;
            default:
                if (canActivate) {
                    this.ide.extensionHost.activate(extension.id);
                    this.ide.addChatMessage(`🤖 ${extension.name} activated`, 'Extension', 'system');
                } else {
                    this.ide.addChatMessage(`✨ ${extension.name} activated`, 'Extension', 'system');
                }
        }
    }

    // ⏹️ Deactivate Extension
    deactivateExtension(extension) {
        this.ide.addChatMessage(`⏹️ ${extension.name} deactivated`, 'Extension', 'system');
    }

    // 📋 Show Extension Details
    showDetails(extensionId) {
        const extension = this.availableExtensions.find(ext => ext.id === extensionId);
        if (!extension) return;

        const details = `
📦 ${extension.name}
👤 Author: ${extension.author}
📝 Description: ${extension.description}
🏷️ Category: ${extension.category}
⭐ Rating: ${extension.rating}/5
📥 Downloads: ${this.formatDownloads(extension.downloads)}
💰 Price: ${extension.price}
🔖 Version: ${extension.version}

🎯 Features:
${extension.features.map(feature => `• ${feature}`).join('\n')}

🏷️ Tags:
${extension.tags.map(tag => `#${tag}`).join(', ')}
        `;

        this.ide.addChatMessage(details, extension.name, 'system');
    }

    // 💳 Buy Extension
    async buy(extensionId) {
        await this.activateLicense(extensionId, 'paid');
    }

    // 🧪 Start Trial
    async startTrial(extensionId) {
        await this.activateLicense(extensionId, 'trial');
    }

    async activateLicense(extensionId, type) {
        const extension = this.availableExtensions.find(ext => ext.id === extensionId);
        if (!extension) return;
        try {
            const res = await fetch(this.ide.apiUrl('/api/licenses/activate'), {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ id: extensionId, type })
            });
            const data = await res.json();
            if (!res.ok) {
                throw new Error(data?.error || `Request failed (${res.status})`);
            }
            if (this.ide.extensionHost) {
                this.ide.extensionHost.grantLicense(extensionId, data.type || type);
            }
            this.ide.addChatMessage(`💳 License activated for ${extension.name}`, 'Marketplace', 'system');
            this.createExtensionCards();
        } catch (error) {
            this.ide.addChatMessage(`❌ License error: ${error.message}`, 'Marketplace', 'system');
        }
    }

    // 💾 Save Installed Extensions
    saveInstalledExtensions() {
        const installedIds = Array.from(this.installedExtensions.keys());
        localStorage.setItem('installedExtensions', JSON.stringify(installedIds));
    }

    // 📊 Format Downloads
    formatDownloads(downloads) {
        if (downloads >= 1000000) {
            return (downloads / 1000000).toFixed(1) + 'M';
        } else if (downloads >= 1000) {
            return (downloads / 1000).toFixed(1) + 'K';
        }
        return downloads.toString();
    }

    // 🎨 Setup Filters
    setupFilters() {
        // Category filters
        document.querySelectorAll('.category-item').forEach(item => {
            item.addEventListener('click', () => {
                document.querySelectorAll('.category-item').forEach(i => i.classList.remove('active'));
                item.classList.add('active');
                this.createExtensionCards();
            });
        });

        // Other filters
        ['free-only', 'installed-only'].forEach(filterId => {
            document.getElementById(filterId)?.addEventListener('change', () => {
                this.createExtensionCards();
            });
        });

        // Sort
        document.getElementById('sort-by')?.addEventListener('change', () => {
            this.createExtensionCards();
        });
    }

    // 🔍 Setup Search
    setupSearch() {
        const searchInput = document.getElementById('extension-search');
        if (searchInput) {
            let searchTimeout;
            searchInput.addEventListener('input', () => {
                clearTimeout(searchTimeout);
                searchTimeout = setTimeout(() => {
                    this.createExtensionCards();
                }, 300);
            });
        }
    }

    // 🏪 Open Marketplace
    openMarketplace() {
        const modal = document.getElementById('marketplace-modal');
        if (modal) {
            modal.classList.remove('hidden');
            this.createExtensionCards();
        }
    }

    // ❌ Close Marketplace
    closeMarketplace() {
        const modal = document.getElementById('marketplace-modal');
        if (modal) {
            modal.classList.add('hidden');
        }
    }

    // 📊 Get Installed Extensions
    getInstalledExtensions() {
        return Array.from(this.installedExtensions.values());
    }

    // 🔍 Get Extension by ID
    getExtension(extensionId) {
        return this.installedExtensions.get(extensionId) || 
               this.availableExtensions.find(ext => ext.id === extensionId);
    }
}

// Export for use in IDE
window.ExtensionMarketplace = ExtensionMarketplace;
