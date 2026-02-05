const fs = require('fs/promises');
const path = require('path');

const DEFAULT_STATE = {
  meta: {
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    version: '1.0.0'
  },
  workspaces: {},
  projects: {},
  marketplace: {
    components: [
      {
        id: 'quantum-button',
        name: 'Quantum Button',
        description: 'Boton con efectos cuanticos',
        category: 'ui',
        code: 'export const QuantumButton = () => <button className=\"quantum-btn\">Click Me</button>',
        author: 'Penguin Alpha',
        downloads: 150,
        rating: 4.8
      },
      {
        id: 'ai-form',
        name: 'AI Form Generator',
        description: 'Generador de formularios con IA',
        category: 'form',
        code: 'export const AIForm = () => <form className=\"ai-form\"><!-- AI Generated --></form>',
        author: 'Penguin Alpha',
        downloads: 89,
        rating: 4.6
      }
    ],
    extensions: [
      {
        id: 'debug-agent',
        name: 'Debug Agent Pro',
        price: '$9/mo',
        tier: 'pro'
      },
      {
        id: 'frontend-agent',
        name: 'Frontend Agent',
        price: '$12/mo',
        tier: 'pro'
      },
      {
        id: 'devops-agent',
        name: 'DevOps Agent',
        price: '$15/mo',
        tier: 'enterprise'
      },
      {
        id: 'quantum-agent',
        name: 'Quantum Agent',
        price: '$18/mo',
        tier: 'enterprise'
      },
      {
        id: 'spatial-agent',
        name: 'Spatial Agent',
        price: '$14/mo',
        tier: 'pro'
      },
      {
        id: 'alchemical-agent',
        name: 'Alchemical Agent',
        price: '$16/mo',
        tier: 'enterprise'
      },
      {
        id: 'terra-agent',
        name: 'Terra Agent',
        price: '$20/mo',
        tier: 'enterprise'
      },
      {
        id: 'self-dev-agent',
        name: 'Self Dev Agent',
        price: '$25/mo',
        tier: 'enterprise'
      },
      {
        id: 'fractal-designer',
        name: 'Fractal Designer',
        price: '$6/mo',
        tier: 'pro'
      },
      {
        id: 'neural-synth',
        name: 'Neural Synth',
        price: '$12/mo',
        tier: 'enterprise'
      },
      {
        id: 'holographic-renderer',
        name: 'Holographic Renderer',
        price: '$10/mo',
        tier: 'pro'
      }
    ]
  },
  licenses: {},
  subscriptions: {},
  audit: {
    lastRun: null,
    lastResult: null
  }
};

class StateStore {
  constructor({ filePath, defaults = DEFAULT_STATE }) {
    this.filePath = filePath;
    this.defaults = defaults;
  }

  async ensureDir() {
    await fs.mkdir(path.dirname(this.filePath), { recursive: true });
  }

  async load() {
    await this.ensureDir();
    try {
      const raw = await fs.readFile(this.filePath, 'utf8');
      const parsed = JSON.parse(raw);
      return this.mergeDefaults(parsed);
    } catch (error) {
      if (error.code === 'ENOENT') {
        const initial = this.mergeDefaults({});
        await this.save(initial);
        return initial;
      }
      throw error;
    }
  }

  async save(state) {
    await this.ensureDir();
    const next = { ...state };
    next.meta = {
      ...(next.meta || {}),
      updatedAt: new Date().toISOString()
    };
    const tmp = `${this.filePath}.tmp`;
    await fs.writeFile(tmp, JSON.stringify(next, null, 2), 'utf8');
    await fs.rename(tmp, this.filePath);
    return next;
  }

  async update(mutator) {
    const current = await this.load();
    const updated = await mutator({ ...current });
    return this.save(updated || current);
  }

  mergeDefaults(state) {
    return {
      ...this.defaults,
      ...state,
      meta: {
        ...this.defaults.meta,
        ...(state.meta || {})
      },
      marketplace: {
        ...this.defaults.marketplace,
        ...(state.marketplace || {}),
        components: state.marketplace?.components || this.defaults.marketplace.components,
        extensions: state.marketplace?.extensions || this.defaults.marketplace.extensions
      }
    };
  }
}

module.exports = { StateStore, DEFAULT_STATE };
