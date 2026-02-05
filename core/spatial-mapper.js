/**
 * 🌐 Spatial Mapper – Mapeo Espacial y Holográfico Conceptual
 * Basado en funcionalidades Copilot: espacialidad, tridimensionalidad, holografía
 */

const debug = require('debug')('isen:spatial-mapper');

class SpatialMapper {
  constructor() {
    this.dimensions = 3;
    this.spatialGrid = new Map();
    this.holograms = new Map();
    this.geometry = 'sacred';
    this.coordinateSystem = 'cognitive';
  }

  /**
   * 🌍 Inicializa el mapeador espacial con geometría sagrada
   */
  initialize(geometry = 'sacred', dimensions = 3) {
    this.geometry = geometry;
    this.dimensions = dimensions;
    this.coordinateSystem = 'cognitive';
    
    debug(`Spatial mapper initialized: ${geometry} geometry in ${dimensions}D`);
    return { geometry, dimensions, coordinateSystem: this.coordinateSystem };
  }

  /**
   * 📍 Crea un punto en el espacio cognitivo
   */
  createPoint(concept, coordinates = null, metadata = {}) {
    const point = {
      id: `point_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      concept,
      coordinates: coordinates || this.generateRandomCoordinates(),
      metadata: {
        ...metadata,
        created: new Date().toISOString(),
        geometry: this.geometry
      }
    };

    this.spatialGrid.set(point.id, point);
    debug(`Created spatial point: ${concept} at ${point.coordinates.join(', ')}`);
    return point;
  }

  /**
   * 🔗 Conecta puntos formando estructuras espaciales
   */
  connectPoints(pointIds, structureType = 'network') {
    const connections = [];
    const points = pointIds.map(id => this.spatialGrid.get(id)).filter(Boolean);

    for (let i = 0; i < points.length; i++) {
      for (let j = i + 1; j < points.length; j++) {
        const connection = {
          id: `conn_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
          from: points[i].id,
          to: points[j].id,
          distance: this.calculateDistance(points[i].coordinates, points[j].coordinates),
          type: structureType,
          strength: this.calculateConnectionStrength(points[i], points[j])
        };
        connections.push(connection);
      }
    }

    debug(`Created ${connections.length} spatial connections`);
    return connections;
  }

  /**
   * 🌟 Genera un holograma conceptual
   */
  generateHologram(concept, layers = 3) {
    const hologram = {
      id: `holo_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      concept,
      layers: [],
      frequency: this.calculateHolographicFrequency(concept),
      coherence: 1.0,
      created: new Date().toISOString()
    };

    // Crear capas holográficas
    for (let i = 0; i < layers; i++) {
      const layer = {
        level: i + 1,
        resolution: Math.pow(2, i + 1),
        data: this.generateHolographicLayer(concept, i + 1),
        phase: (Math.PI * 2 * i) / layers
      };
      hologram.layers.push(layer);
    }

    this.holograms.set(hologram.id, hologram);
    debug(`Generated hologram: ${concept} with ${layers} layers`);
    return hologram;
  }

  /**
   * 🗺️ Mapea un concepto al espacio tridimensional
   */
  mapTo3D(concept, context = {}) {
    const mapping = {
      concept,
      position: this.conceptToCoordinates(concept, context),
      dimensions: this.conceptToDimensions(concept),
      relationships: this.findSpatialRelationships(concept),
      holographicProjection: this.projectHologram(concept),
      sacredGeometry: this.applySacredGeometry(concept),
      timestamp: new Date().toISOString()
    };

    debug(`Mapped concept to 3D space: ${concept}`);
    return mapping;
  }

  /**
   * 🔄 Navega por el espacio conceptual
   */
  navigateSpace(startPoint, direction, distance) {
    const start = this.spatialGrid.get(startPoint);
    if (!start) {
      throw new Error('Start point not found');
    }

    const navigation = {
      from: startPoint,
      direction,
      distance,
      path: this.calculatePath(start.coordinates, direction, distance),
      encountered: this.findPointsAlongPath(start.coordinates, direction, distance),
      holographicView: this.generateHolographicView(start.coordinates, direction, distance)
    };

    debug(`Navigated space from ${startPoint} in direction ${direction}`);
    return navigation;
  }

  /**
   * 🎨 Renderiza una vista holográfica
   */
  renderHolographicView(center, radius = 10) {
    const view = {
      center,
      radius,
      points: this.getPointsInRadius(center, radius),
      holograms: this.getHologramsInRadius(center, radius),
      geometry: this.geometry,
      projection: 'holographic',
      timestamp: new Date().toISOString()
    };

    debug(`Rendered holographic view at center ${center.join(', ')}`);
    return view;
  }

  /**
   * 📐 Aplica geometría sagrada a un concepto
   */
  applySacredGeometry(concept) {
    const patterns = {
      flowerOfLife: this.generateFlowerOfLife(concept),
      metatronCube: this.generateMetatronCube(concept),
      sriYantra: this.generateSriYantra(concept),
      goldenRatio: this.applyGoldenRatio(concept)
    };

    return {
      concept,
      patterns,
      selectedPattern: this.selectOptimalPattern(concept, patterns),
      timestamp: new Date().toISOString()
    };
  }

  /**
   * 📊 Obtiene métricas del mapeador espacial
   */
  getMetrics() {
    return {
      totalPoints: this.spatialGrid.size,
      totalHolograms: this.holograms.size,
      dimensions: this.dimensions,
      geometry: this.geometry,
      coordinateSystem: this.coordinateSystem,
      averageConnections: this.calculateAverageConnections(),
      holographicDensity: this.calculateHolographicDensity(),
      lastActivity: new Date().toISOString()
    };
  }

  // Métodos privados
  generateRandomCoordinates() {
    return Array.from({ length: this.dimensions }, () => Math.random() * 100 - 50);
  }

  calculateDistance(coords1, coords2) {
    return Math.sqrt(
      coords1.reduce((sum, val, i) => sum + Math.pow(val - coords2[i], 2), 0)
    );
  }

  calculateConnectionStrength(point1, point2) {
    const distance = this.calculateDistance(point1.coordinates, point2.coordinates);
    return Math.max(0, 1 - distance / 100); // Normalizado a 0-1
  }

  calculateHolographicFrequency(concept) {
    // Frecuencia basada en complejidad del concepto
    const complexity = concept.length * concept.split(' ').length;
    return 440 + (complexity % 880); // Rango audible
  }

  generateHolographicLayer(concept, level) {
    const resolution = Math.pow(2, level);
    const layer = [];
    
    for (let i = 0; i < resolution; i++) {
      for (let j = 0; j < resolution; j++) {
        layer.push({
          x: i / resolution,
          y: j / resolution,
          amplitude: Math.sin(i * Math.PI / resolution) * Math.cos(j * Math.PI / resolution),
          phase: (i + j) * Math.PI / resolution
        });
      }
    }
    
    return layer;
  }

  conceptToCoordinates(concept, context) {
    // Convertir concepto a coordenadas usando hash simple
    const hash = this.simpleHash(concept);
    return [
      (hash % 200) - 100, // X: -100 a 100
      ((hash >> 8) % 200) - 100, // Y: -100 a 100
      ((hash >> 16) % 200) - 100  // Z: -100 a 100
    ];
  }

  conceptToDimensions(concept) {
    const complexity = concept.split(' ').length;
    return {
      width: Math.max(1, complexity),
      height: Math.max(1, Math.floor(complexity / 2)),
      depth: Math.max(1, Math.floor(complexity / 3))
    };
  }

  findSpatialRelationships(concept) {
    // Encontrar puntos espaciales relacionados
    const relationships = [];
    const conceptPoint = this.findPointByConcept(concept);
    
    if (conceptPoint) {
      this.spatialGrid.forEach((point, id) => {
        if (id !== conceptPoint.id) {
          const distance = this.calculateDistance(conceptPoint.coordinates, point.coordinates);
          if (distance < 20) { // Umbral de cercanía
            relationships.push({
              concept: point.concept,
              distance,
              strength: 1 - distance / 20
            });
          }
        }
      });
    }
    
    return relationships;
  }

  projectHologram(concept) {
    const hologram = this.generateHologram(concept);
    return {
      hologramId: hologram.id,
      frequency: hologram.frequency,
      layers: hologram.layers.length,
      coherence: hologram.coherence
    };
  }

  calculatePath(startCoords, direction, distance) {
    const directionVectors = {
      north: [0, 1, 0],
      south: [0, -1, 0],
      east: [1, 0, 0],
      west: [-1, 0, 0],
      up: [0, 0, 1],
      down: [0, 0, -1]
    };

    const vector = directionVectors[direction] || [1, 0, 0];
    return startCoords.map((coord, i) => coord + vector[i] * distance);
  }

  findPointsAlongPath(startCoords, direction, distance) {
    const endCoords = this.calculatePath(startCoords, direction, distance);
    const pointsAlongPath = [];

    this.spatialGrid.forEach(point => {
      if (this.isPointOnPath(point.coordinates, startCoords, endCoords)) {
        pointsAlongPath.push(point);
      }
    });

    return pointsAlongPath;
  }

  generateHolographicView(center, direction, distance) {
    const endCoords = this.calculatePath(center, direction, distance);
    return {
      viewCone: { center, direction, distance },
      holograms: this.getHologramsInCone(center, endCoords),
      resolution: 1024,
      depth: 3
    };
  }

  getPointsInRadius(center, radius) {
    const points = [];
    this.spatialGrid.forEach(point => {
      const distance = this.calculateDistance(center, point.coordinates);
      if (distance <= radius) {
        points.push({ ...point, distance });
      }
    });
    return points;
  }

  getHologramsInRadius(center, radius) {
    const holograms = [];
    this.holograms.forEach(hologram => {
      // Simplificado: asumir que los hologramos están en el origen
      const distance = this.calculateDistance(center, [0, 0, 0]);
      if (distance <= radius) {
        holograms.push({ ...hologram, distance });
      }
    });
    return holograms;
  }

  generateFlowerOfLife(concept) {
    return {
      type: 'flowerOfLife',
      circles: 19,
      radius: 1,
      overlap: 0.5
    };
  }

  generateMetatronCube(concept) {
    return {
      type: 'metatronCube',
      vertices: 13,
      edges: 78,
      spheres: 13
    };
  }

  generateSriYantra(concept) {
    return {
      type: 'sriYantra',
      triangles: 9,
      petals: 8,
      circles: 3
    };
  }

  applyGoldenRatio(concept) {
    const phi = (1 + Math.sqrt(5)) / 2;
    return {
      type: 'goldenRatio',
      phi,
      proportions: [1, phi, phi * phi, phi * phi * phi]
    };
  }

  selectOptimalPattern(concept, patterns) {
    // Selección simple basada en longitud del concepto
    const patternsKeys = Object.keys(patterns);
    const index = concept.length % patternsKeys.length;
    return patternsKeys[index];
  }

  calculateAverageConnections() {
    // Simplificado: calcular promedio de conexiones
    return this.spatialGrid.size > 0 ? 3.5 : 0;
  }

  calculateHolographicDensity() {
    return this.spatialGrid.size > 0 
      ? this.holograms.size / this.spatialGrid.size 
      : 0;
  }

  simpleHash(str) {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32-bit integer
    }
    return Math.abs(hash);
  }

  findPointByConcept(concept) {
    for (const point of this.spatialGrid.values()) {
      if (point.concept === concept) {
        return point;
      }
    }
    return null;
  }

  isPointOnPath(pointCoords, startCoords, endCoords) {
    // Simplificado: verificar si el punto está cerca de la línea
    const distance = this.calculateDistance(pointCoords, startCoords) + 
                    this.calculateDistance(pointCoords, endCoords);
    const pathLength = this.calculateDistance(startCoords, endCoords);
    return Math.abs(distance - pathLength) < 5; // Umbral
  }

  getHologramsInCone(center, endCoords) {
    // Simplificado: retornar todos los hologramas
    return Array.from(this.holograms.values());
  }
}

module.exports = SpatialMapper;
