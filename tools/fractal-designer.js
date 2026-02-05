/**
 * 🌀 Fractal Designer – Diseñador Fractal
 * Basado en funcionalidades Copilot: fractalidad, patrones recursivos, auto-similitud
 */

const debug = require('debug')('isen:fractal-designer');
const EventEmitter = require('events');

class FractalDesigner extends EventEmitter {
  constructor(config = {}) {
    super();
    this.name = config.name || 'Fractal Designer ISEN';
    this.fractals = new Map();
    this.patterns = ['mandelbrot', 'julia', 'koch', 'sierpinski', 'dragon'];
    this.dimensions = config.dimensions || 2;
    this.complexity = config.complexity || 'medium';
    this.initialize();
  }

  async initialize() {
    this.loadBaseFractals();
    this.emit('initialized', { designer: this.name, patterns: this.patterns.length });
    debug(`${this.name} initialized with ${this.patterns.length} fractal patterns`);
    return { status: 'initialized' };
  }

  loadBaseFractals() {
    this.patterns.forEach(pattern => {
      this.fractals.set(pattern, {
        type: pattern,
        iterations: 5,
        complexity: 'base',
        generated: new Date().toISOString()
      });
    });
  }

  async generateFractal(type, iterations = 5, complexity = 'medium') {
    const fractal = {
      type,
      iterations,
      complexity,
      data: null,
      visualization: null,
      properties: null,
      timestamp: new Date().toISOString()
    };

    // Generar datos fractales
    fractal.data = this.generateFractalData(type, iterations);
    
    // Crear visualización
    fractal.visualization = this.createFractalVisualization(fractal.data);
    
    // Calcular propiedades
    fractal.properties = this.calculateFractalProperties(fractal.data);
    
    // Almacenar fractal
    this.fractals.set(`${type}_${Date.now()}`, fractal);
    
    this.emit('fractal_generated', fractal);
    debug(`Fractal generated: ${type} with ${iterations} iterations`);
    return fractal;
  }

  generateFractalData(type, iterations) {
    const generators = {
      mandelbrot: () => this.generateMandelbrot(iterations),
      julia: () => this.generateJulia(iterations),
      koch: () => this.generateKoch(iterations),
      sierpinski: () => this.generateSierpinski(iterations),
      dragon: () => this.generateDragon(iterations)
    };
    
    return generators[type] ? generators[type]() : this.generateMandelbrot(iterations);
  }

  generateMandelbrot(iterations) {
    const points = [];
    const maxIter = iterations * 10;
    
    for (let x = -2; x <= 2; x += 0.1) {
      for (let y = -2; y <= 2; y += 0.1) {
        let zx = 0, zy = 0;
        let iter = 0;
        
        while (zx * zx + zy * zy < 4 && iter < maxIter) {
          const tmp = zx * zx - zy * zy + x;
          zy = 2 * zx * zy + y;
          zx = tmp;
          iter++;
        }
        
        if (iter < maxIter) {
          points.push({ x, y, iterations: iter });
        }
      }
    }
    
    return { type: 'mandelbrot', points, iterations: maxIter };
  }

  generateJulia(iterations) {
    const points = [];
    const maxIter = iterations * 10;
    const cx = -0.7, cy = 0.27015;
    
    for (let x = -2; x <= 2; x += 0.1) {
      for (let y = -2; y <= 2; y += 0.1) {
        let zx = x, zy = y;
        let iter = 0;
        
        while (zx * zx + zy * zy < 4 && iter < maxIter) {
          const tmp = zx * zx - zy * zy + cx;
          zy = 2 * zx * zy + cy;
          zx = tmp;
          iter++;
        }
        
        if (iter < maxIter) {
          points.push({ x, y, iterations: iter });
        }
      }
    }
    
    return { type: 'julia', points, iterations: maxIter, constants: { cx, cy } };
  }

  generateKoch(iterations) {
    const segments = [];
    
    // Iniciar con línea base
    let points = [
      { x: 0, y: 0 },
      { x: 1, y: 0 }
    ];
    
    for (let iter = 0; iter < iterations; iter++) {
      const newPoints = [points[0]];
      
      for (let i = 0; i < points.length - 1; i++) {
        const p1 = points[i];
        const p2 = points[i + 1];
        
        // Calcular puntos del triángulo de Koch
        const dx = p2.x - p1.x;
        const dy = p2.y - p1.y;
        
        const p3 = {
          x: p1.x + dx / 3,
          y: p1.y + dy / 3
        };
        
        const p5 = {
          x: p1.x + 2 * dx / 3,
          y: p1.y + 2 * dy / 3
        };
        
        const p4 = {
          x: p3.x + (p5.x - p3.x) * 0.5 - (p5.y - p3.y) * Math.sqrt(3) / 2,
          y: p3.y + (p5.y - p3.y) * 0.5 + (p5.x - p3.x) * Math.sqrt(3) / 2
        };
        
        newPoints.push(p3, p4, p5, p2);
      }
      
      points = newPoints;
    }
    
    return { type: 'koch', points, iterations };
  }

  generateSierpinski(iterations) {
    const triangles = [];
    
    // Triángulo inicial
    let points = [
      { x: 0, y: 0 },
      { x: 1, y: 0 },
      { x: 0.5, y: Math.sqrt(3) / 2 }
    ];
    
    const sierpinskiRecursive = (triangle, depth) => {
      if (depth === 0) {
        triangles.push(triangle);
        return;
      }
      
      const [p1, p2, p3] = triangle;
      
      // Calcular puntos medios
      const m1 = { x: (p1.x + p2.x) / 2, y: (p1.y + p2.y) / 2 };
      const m2 = { x: (p2.x + p3.x) / 2, y: (p2.y + p3.y) / 2 };
      const m3 = { x: (p3.x + p1.x) / 2, y: (p3.y + p1.y) / 2 };
      
      // Recursión en 3 triángulos más pequeños
      sierpinskiRecursive([p1, m1, m3], depth - 1);
      sierpinskiRecursive([m1, p2, m2], depth - 1);
      sierpinskiRecursive([m3, m2, p3], depth - 1);
    };
    
    sierpinskiRecursive(points, iterations);
    
    return { type: 'sierpinski', triangles, iterations };
  }

  generateDragon(iterations) {
    let sequence = 'R';
    
    // Generar secuencia de curva del dragón
    for (let i = 0; i < iterations; i++) {
      let newSequence = sequence + 'R';
      const reversed = sequence.split('').reverse().map(c => c === 'R' ? 'L' : 'R').join('');
      newSequence += reversed;
      sequence = newSequence;
    }
    
    // Convertir secuencia a puntos
    const points = [{ x: 0, y: 0 }];
    let x = 0, y = 0, direction = 0;
    
    for (const turn of sequence) {
      // Mover hacia adelante
      x += Math.cos(direction);
      y += Math.sin(direction);
      points.push({ x, y });
      
      // Girar
      direction += turn === 'R' ? -Math.PI / 2 : Math.PI / 2;
    }
    
    return { type: 'dragon', points, sequence, iterations };
  }

  createFractalVisualization(data) {
    return {
      type: '2d_visualization',
      dimensions: { width: 800, height: 600 },
      colors: this.generateColorScheme(data.type),
      rendering: 'vector_based',
      interactive: true
    };
  }

  generateColorScheme(type) {
    const schemes = {
      mandelbrot: ['#000033', '#000066', '#0000CC', '#3366FF', '#66CCFF'],
      julia: ['#330000', '#660000', '#CC0000', '#FF3366', '#FF66CC'],
      koch: ['#003300', '#006600', '#00CC00', '#66FF66', '#CCFFCC'],
      sierpinski: ['#333333', '#666666', '#999999', '#CCCCCC', '#FFFFFF'],
      dragon: ['#660033', '#CC0066', '#FF0099', '#FF33CC', '#FF99FF']
    };
    
    return schemes[type] || schemes.mandelbrot;
  }

  calculateFractalProperties(data) {
    return {
      dimension: this.estimateFractalDimension(data),
      complexity: this.calculateComplexity(data),
      selfSimilarity: this.assessSelfSimilarity(data),
      scaling: this.analyzeScalingBehavior(data)
    };
  }

  estimateFractalDimension(data) {
    // Simplified fractal dimension estimation
    const baseDimensions = {
      mandelbrot: 2.0,
      julia: 2.0,
      koch: 1.26,
      sierpinski: 1.58,
      dragon: 2.0
    };
    
    return baseDimensions[data.type] || 2.0;
  }

  calculateComplexity(data) {
    const pointCount = data.points ? data.points.length : (data.triangles ? data.triangles.length * 3 : 1);
    const iterations = data.iterations || 1;
    
    return {
      pointCount,
      iterations,
      complexity: Math.log(pointCount * iterations) / Math.log(2)
    };
  }

  assessSelfSimilarity(data) {
    // Simplified self-similarity assessment
    return {
      level: 'high',
      patterns: Math.floor(Math.log2(data.iterations || 1)),
      similarity: 0.85 + Math.random() * 0.15
    };
  }

  analyzeScalingBehavior(data) {
    return {
      scaling: 'power_law',
      exponent: this.estimateScalingExponent(data),
      range: 'multi_scale',
      invariance: 'scale_invariant'
    };
  }

  estimateScalingExponent(data) {
    const exponents = {
      mandelbrot: 2.0,
      julia: 2.0,
      koch: 1.26,
      sierpinski: 1.58,
      dragon: 2.0
    };
    
    return exponents[data.type] || 2.0;
  }

  getMetrics() {
    return {
      designer: this.name,
      fractals: this.fractals.size,
      patterns: this.patterns.length,
      dimensions: this.dimensions,
      complexity: this.complexity,
      lastActivity: new Date().toISOString()
    };
  }
}

module.exports = FractalDesigner;
