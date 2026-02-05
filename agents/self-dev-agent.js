const fs = require('fs/promises');
const path = require('path');

class SelfDevAgent {
  constructor(config = {}) {
    this.name = config.name || 'Self Dev Agent ISEN';
    this.rootDir = config.rootDir || process.cwd();
    this.permissions = config.permissions || { allowRoots: [this.rootDir] };
    this.llm = config.llm || null;
    this.markers = new Set([
      'package.json',
      'pyproject.toml',
      'requirements.txt',
      'Pipfile',
      'Dockerfile',
      'docker-compose.yml',
      'docker-compose.yaml',
      'vercel.json',
      'netlify.toml',
      'render.yaml',
      'render.yml',
      'go.mod',
      'pom.xml',
      'build.gradle',
      'Cargo.toml',
      'Gemfile',
      'composer.json'
    ]);
    this.skipDirs = new Set(['node_modules', '.git', '.idea', '.venv', 'dist', 'build', '.next', 'out']);
  }

  resolveRoots(roots = []) {
    const allowRoots = this.permissions?.allowRoots || [this.rootDir];
    if (allowRoots.includes('*')) {
      return roots.length ? roots : [this.rootDir];
    }
    if (roots.length) {
      return roots.filter(root => this.isAllowedPath(root));
    }
    return allowRoots;
  }

  isAllowedPath(targetPath) {
    const allowRoots = this.permissions?.allowRoots || [this.rootDir];
    if (allowRoots.includes('*')) return true;
    const resolved = path.resolve(targetPath);
    return allowRoots.some(root => resolved.startsWith(path.resolve(root)));
  }

  async scanProjects(options = {}) {
    const roots = this.resolveRoots(options.roots || []);
    const maxDepth = options.maxDepth ?? 4;
    const maxResults = options.maxResults ?? 200;
    const results = [];

    for (const root of roots) {
      const rootPath = path.resolve(root);
      const queue = [{ dir: rootPath, depth: 0 }];

      while (queue.length && results.length < maxResults) {
        const { dir, depth } = queue.shift();
        if (!this.isAllowedPath(dir)) continue;
        let entries = [];
        try {
          entries = await fs.readdir(dir, { withFileTypes: true });
        } catch {
          continue;
        }

        for (const entry of entries) {
          const fullPath = path.join(dir, entry.name);
          if (entry.isDirectory()) {
            if (this.skipDirs.has(entry.name)) continue;
            if (depth < maxDepth) {
              queue.push({ dir: fullPath, depth: depth + 1 });
            }
            continue;
          }
          if (!this.markers.has(entry.name)) continue;
          results.push({
            root: rootPath,
            projectDir: dir,
            marker: entry.name
          });
          if (results.length >= maxResults) break;
        }
      }
    }

    const projects = this.groupProjects(results);
    const scored = await this.scoreProjects(projects);
    return {
      agent: this.name,
      roots,
      totalMatches: results.length,
      projects: scored,
      recommendations: this.buildRecommendations(scored),
      timestamp: new Date().toISOString()
    };
  }

  groupProjects(matches) {
    const map = new Map();
    matches.forEach(match => {
      const key = match.projectDir;
      if (!map.has(key)) {
        map.set(key, { path: key, markers: new Set(), roots: new Set([match.root]) });
      }
      const entry = map.get(key);
      entry.markers.add(match.marker);
      entry.roots.add(match.root);
    });

    return Array.from(map.values()).map(entry => ({
      path: entry.path,
      markers: Array.from(entry.markers).sort(),
      roots: Array.from(entry.roots).sort()
    }));
  }

  async scoreProjects(projects) {
    const scored = [];
    for (const project of projects) {
      const analysis = await this.analyzeProject(project);
      scored.push({ ...project, ...analysis });
    }
    return scored.sort((a, b) => b.score - a.score);
  }

  async analyzeProject(project) {
    const markers = new Set(project.markers);
    const isNode = markers.has('package.json');
    const isPython = markers.has('requirements.txt') || markers.has('pyproject.toml');
    const hasDocker = markers.has('Dockerfile') || markers.has('docker-compose.yml') || markers.has('docker-compose.yaml');
    const hasDeploy = markers.has('vercel.json') || markers.has('netlify.toml') || markers.has('render.yaml') || markers.has('render.yml');

    const scripts = await this.readPackageScripts(project.path);
    const hasStart = Boolean(scripts.start);
    const hasBuild = Boolean(scripts.build);
    const hasDev = Boolean(scripts.dev);

    let score = 0;
    if (isNode) score += 2;
    if (isPython) score += 2;
    if (hasDocker) score += 2;
    if (hasDeploy) score += 2;
    if (hasStart) score += 1;
    if (hasBuild) score += 1;
    if (hasDev) score += 1;

    const readiness = score >= 7 ? 'ready' : score >= 5 ? 'close' : 'early';
    return {
      type: isNode ? 'node' : isPython ? 'python' : 'mixed',
      scripts,
      readiness,
      score
    };
  }

  async readPackageScripts(projectDir) {
    const pkgPath = path.join(projectDir, 'package.json');
    try {
      const raw = await fs.readFile(pkgPath, 'utf8');
      const json = JSON.parse(raw);
      return json.scripts || {};
    } catch {
      return {};
    }
  }

  buildRecommendations(projects) {
    const recs = [];
    const ready = projects.filter(p => p.readiness === 'ready');
    const close = projects.filter(p => p.readiness === 'close');
    if (ready.length) {
      recs.push(`Hay ${ready.length} proyectos listos para deploy. Prioriza los de mayor score.`);
    }
    if (close.length) {
      recs.push(`Hay ${close.length} proyectos casi listos. Completa scripts build/start o agrega config de deploy.`);
    }
    if (!projects.length) {
      recs.push('No se detectaron proyectos. Agrega marker files (package.json, Dockerfile, etc).');
    }
    return recs;
  }

  async generatePlan(context = {}) {
    const base = {
      agent: this.name,
      focus: context.focus || 'ide',
      steps: [
        'Auditar estructura y dependencias',
        'Definir roadmap tecnico',
        'Priorizar features de monetizacion',
        'Preparar pipeline de deploy',
        'Ejecutar smoke tests'
      ],
      timestamp: new Date().toISOString()
    };
    if (!this.llm || !this.llm.isEnabled()) return base;

    const reply = await this.llm.chat([
      { role: 'system', content: 'Eres un asesor tecnico. Devuelve un plan conciso en 5 pasos.' },
      { role: 'user', content: JSON.stringify(context) }
    ], { temperature: 0.2, max_tokens: 300 });

    if (!reply.ok) return base;

    return {
      ...base,
      llmPlan: reply.content
    };
  }
}

module.exports = SelfDevAgent;
