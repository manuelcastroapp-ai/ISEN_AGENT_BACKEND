/**
 * 🌌 Quantum Engine – Motor Cuántico‑Sintético
 * Basado en funcionalidades Copilot 1–3: pensamiento cuántico, superposición, no linealidad
 */

const debug = require('debug')('isen:quantum-engine');

class QuantumEngine {
  constructor() {
    this.quantumState = 'superposition';
    this.probabilityField = new Map();
    this.entanglements = new Map();
    this.observers = [];
    this.coherenceLevel = 1.0;
  }

  /**
   * 🧠 Inicializa el motor cuántico con estado base
   */
  initialize(baseState = 'neutral') {
    this.quantumState = baseState;
    this.coherenceLevel = 1.0;
    debug(`Quantum engine initialized with state: ${baseState}`);
    return { state: this.quantumState, coherence: this.coherenceLevel };
  }

  /**
   * 🌊 Crea una superposición de estados probabilísticos
   */
  createSuperposition(states, probabilities) {
    if (states.length !== probabilities.length) {
      throw new Error('States and probabilities must have same length');
    }

    const id = `${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
    const superposition = {
      id,
      states,
      probabilities: this.normalizeProbabilities(probabilities),
      timestamp: new Date().toISOString(),
      coherence: this.coherenceLevel
    };

    this.probabilityField.set(id, superposition);
    debug(`Superposition created with ${states.length} states`);
    return superposition;
  }

  /**
   * 🔗 Entrelaza dos conceptos o agentes
   */
  entangle(entityA, entityB, strength = 0.8) {
    const entanglement = {
      entityA,
      entityB,
      strength,
      created: new Date().toISOString(),
      active: true
    };
    
    this.entanglements.set(`${entityA}-${entityB}`, entanglement);
    debug(`Entanglement created: ${entityA} ↔ ${entityB} (strength: ${strength})`);
    return entanglement;
  }

  /**
   * 👁️ Colapsa la superposición a un estado definido (observación)
   */
  observe(superpositionId) {
    const superposition = this.probabilityField.get(superpositionId);
    if (!superposition) {
      throw new Error('Superposition not found');
    }

    // Colapso cuántico basado en probabilidades
    const collapsedState = this.collapseToState(superposition);
    this.quantumState = collapsedState.state;
    this.coherenceLevel *= 0.95; // Decoherencia parcial

    // Eliminar superposición colapsada
    this.probabilityField.delete(superpositionId);

    debug(`Superposition collapsed to: ${collapsedState.state}`);
    return {
      collapsedState,
      previousCoherence: superposition.coherence,
      newCoherence: this.coherenceLevel
    };
  }

  /**
   * 🌌 Aplica no linealidad al procesamiento
   */
  applyNonLinearTransform(data, transformType = 'quantum') {
    const transforms = {
      quantum: (x) => Math.sin(x) * Math.exp(-Math.abs(x) / 10),
      fractal: (x) => x * x - 2,
      chaos: (x) => 3.7 * x * (1 - x),
      holographic: (x) => Math.cos(x) * Math.sin(x * 2)
    };

    const transform = transforms[transformType] || transforms.quantum;
    const transformed = Array.isArray(data) 
      ? data.map(transform)
      : transform(data);

    debug(`Applied ${transformType} transform to data`);
    return {
      original: data,
      transformed,
      transformType,
      timestamp: new Date().toISOString()
    };
  }

  /**
   * 🎯 Calcula la probabilidad cuántica de un resultado
   */
  calculateQuantumProbability(context, outcomes) {
    const baseProbabilities = outcomes.map(() => Math.random());
    const contextWeight = this.analyzeContextWeight(context);
    
    // Ajustar probabilidades basadas en contexto cuántico
    const adjustedProbabilities = baseProbabilities.map((p, i) => 
      p * (1 + contextWeight * Math.sin(i + Date.now() / 1000))
    );

    const normalized = this.normalizeProbabilities(adjustedProbabilities);
    
    return {
      outcomes,
      probabilities: normalized,
      contextWeight,
      quantumState: this.quantumState,
      timestamp: new Date().toISOString()
    };
  }

  /**
   * 🔄 Sincroniza con otros agentes cuánticos
   */
  quantumSync(otherEngines) {
    const syncData = {
      localState: this.quantumState,
      coherence: this.coherenceLevel,
      entanglements: Array.from(this.entanglements.values()),
      timestamp: new Date().toISOString()
    };

    // Simular sincronización cuántica
    otherEngines.forEach(engine => {
      if (engine.receiveQuantumSync) {
        engine.receiveQuantumSync(syncData);
      }
    });

    debug(`Quantum sync completed with ${otherEngines.length} engines`);
    return syncData;
  }

  /**
   * 📊 Obtiene métricas del motor cuántico
   */
  getMetrics() {
    return {
      quantumState: this.quantumState,
      coherenceLevel: this.coherenceLevel,
      activeSuperpositions: this.probabilityField.size,
      activeEntanglements: this.entanglements.size,
      observerCount: this.observers.length,
      lastActivity: new Date().toISOString()
    };
  }

  // Métodos privados
  normalizeProbabilities(probabilities) {
    const sum = probabilities.reduce((a, b) => a + b, 0);
    if (!sum) {
      return probabilities.map(() => 1 / probabilities.length);
    }
    return probabilities.map(p => p / sum);
  }

  collapseToState(superposition) {
    const random = Math.random();
    let cumulative = 0;
    
    for (let i = 0; i < superposition.states.length; i++) {
      cumulative += superposition.probabilities[i];
      if (random <= cumulative) {
        return { state: superposition.states[i], probability: superposition.probabilities[i] };
      }
    }
    
    return { state: superposition.states[0], probability: superposition.probabilities[0] };
  }

  analyzeContextWeight(context) {
    // Análisis simple del peso del contexto (0-1)
    const factors = [
      context.complexity || 0.5,
      context.uncertainty || 0.5,
      context.creativity || 0.5,
      context.innovation || 0.5
    ];
    return factors.reduce((a, b) => a + b, 0) / factors.length;
  }

  receiveQuantumSync(syncData) {
    // Recibir sincronización de otro motor cuántico
    debug(`Received quantum sync from external engine`);
    this.observers.push(syncData);
  }
}

module.exports = QuantumEngine;
