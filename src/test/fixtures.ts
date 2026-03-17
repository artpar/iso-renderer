/**
 * Test fixtures — reusable IsoMap data for tests.
 * Domain-agnostic: just cities, buildings, roads, pipes with colors/positions.
 */
import type { IsoMap, MapBuilding } from '../types';

/** Minimal valid map — single city, one building */
export function singleBuildingMap(): IsoMap {
  return {
    version: 1,
    bounds: { minX: 0, maxX: 20, minZ: 0, maxZ: 20 },
    cities: [{
      id: 'city-1',
      label: 'Alpha',
      category: 'primary',
      x: 2, z: 2, width: 16, depth: 16,
      isFocus: true,
      importance: 0.5,
      inputPorts: [],
      outputPorts: [],
      grid: {
        cols: 1, rows: 1,
        colX: [4], rowZ: [4],
        colWidths: [12], rowHeights: [12],
      },
      subPlatforms: [],
    }],
    buildings: [{
      id: 'b-1',
      label: 'Block A',
      category: 'unit',
      color: '#E67E22',
      worldX: 6, worldZ: 6, width: 4, depth: 4, height: 4,
      importance: 0.7,
      cityId: 'city-1',
    }],
    roads: [],
    pipelines: [],
    districts: [],
  };
}

/** Three buildings in a city — tests grid layout and depth sorting */
export function threeBuildingsMap(): IsoMap {
  return {
    version: 1,
    bounds: { minX: 0, maxX: 30, minZ: 0, maxZ: 30 },
    cities: [{
      id: 'city-1',
      label: 'Workshop',
      category: 'primary',
      x: 2, z: 2, width: 26, depth: 26,
      isFocus: true,
      importance: 0.6,
      inputPorts: [],
      outputPorts: [],
      grid: {
        cols: 3, rows: 1,
        colX: [4, 12, 20], rowZ: [4],
        colWidths: [6, 6, 6], rowHeights: [22],
      },
      subPlatforms: [],
    }],
    buildings: [
      {
        id: 'b-add',
        label: 'Adder',
        category: 'unit',
        color: '#E84D8A',
        worldX: 5, worldZ: 8, width: 4, depth: 2, height: 2,
        importance: 0.4,
        cityId: 'city-1',
      },
      {
        id: 'b-format',
        label: 'Formatter',
        category: 'unit',
        color: '#F2D024',
        worldX: 13, worldZ: 10, width: 5, depth: 1, height: 1,
        importance: 0.6,
        cityId: 'city-1',
      },
      {
        id: 'b-count',
        label: 'Counter',
        category: 'store',
        color: '#E84D8A',
        worldX: 21, worldZ: 6, width: 2, depth: 1, height: 1,
        importance: 0.3,
        cityId: 'city-1',
      },
    ],
    roads: [],
    pipelines: [],
    districts: [],
  };
}

/** Two cities connected by a road */
export function twoCitiesWithRoadMap(): IsoMap {
  return {
    version: 1,
    bounds: { minX: 0, maxX: 60, minZ: 0, maxZ: 30 },
    cities: [
      {
        id: 'city-a',
        label: 'Factory A',
        category: 'primary',
        x: 2, z: 2, width: 20, depth: 26,
        isFocus: false,
        importance: 0.5,
        inputPorts: [],
        outputPorts: [{ name: 'output', color: '#E67E22', x: 10, width: 4 }],
        grid: {
          cols: 1, rows: 1,
          colX: [4], rowZ: [4],
          colWidths: [16], rowHeights: [22],
        },
        subPlatforms: [],
      },
      {
        id: 'city-b',
        label: 'Factory B',
        category: 'secondary',
        x: 38, z: 2, width: 20, depth: 26,
        isFocus: true,
        importance: 0.7,
        inputPorts: [{ name: 'input', color: '#4A90D9', x: 8, width: 6 }],
        outputPorts: [],
        grid: {
          cols: 1, rows: 1,
          colX: [40], rowZ: [4],
          colWidths: [16], rowHeights: [22],
        },
        subPlatforms: [],
      },
    ],
    buildings: [
      {
        id: 'b-source',
        label: 'Source',
        category: 'unit',
        color: '#E67E22',
        worldX: 8, worldZ: 10, width: 4, depth: 4, height: 4,
        importance: 0.8,
        cityId: 'city-a',
      },
      {
        id: 'b-dest',
        label: 'Destination',
        category: 'unit',
        color: '#1ABC9C',
        worldX: 44, worldZ: 10, width: 6, depth: 4, height: 3,
        importance: 0.9,
        cityId: 'city-b',
      },
    ],
    roads: [{
      sourceCityId: 'city-a',
      targetCityId: 'city-b',
      waypoints: [[22, 0.08, 15], [30, 0.08, 15], [38, 0.08, 15]],
      width: 2,
      intensity: 0.6,
      category: 'flow',
      color: '#E67E22',
    }],
    pipelines: [],
    districts: [],
  };
}

/** City with pipelines */
export function cityWithPipelinesMap(): IsoMap {
  return {
    version: 1,
    bounds: { minX: 0, maxX: 30, minZ: 0, maxZ: 30 },
    cities: [{
      id: 'city-1',
      label: 'Processor',
      category: 'primary',
      x: 2, z: 2, width: 26, depth: 26,
      isFocus: true,
      importance: 0.6,
      inputPorts: [
        { name: 'in-1', color: '#E84D8A', x: 6, width: 3 },
        { name: 'in-2', color: '#E84D8A', x: 12, width: 3 },
      ],
      outputPorts: [
        { name: 'out-1', color: '#E84D8A', x: 10, width: 4 },
      ],
      grid: {
        cols: 2, rows: 2,
        colX: [4, 16], rowZ: [4, 16],
        colWidths: [10, 10], rowHeights: [10, 10],
      },
      subPlatforms: [],
    }],
    buildings: [
      {
        id: 'b-in1',
        label: 'Input 1',
        category: 'port',
        color: '#E84D8A',
        worldX: 6, worldZ: 6, width: 2, depth: 1, height: 1,
        importance: 0.5,
        cityId: 'city-1',
      },
      {
        id: 'b-in2',
        label: 'Input 2',
        category: 'port',
        color: '#E84D8A',
        worldX: 18, worldZ: 6, width: 2, depth: 1, height: 1,
        importance: 0.5,
        cityId: 'city-1',
      },
      {
        id: 'b-out',
        label: 'Output',
        category: 'port',
        color: '#E84D8A',
        worldX: 12, worldZ: 18, width: 2, depth: 1, height: 1,
        importance: 0.7,
        cityId: 'city-1',
      },
    ],
    roads: [],
    pipelines: [
      {
        id: 'pipe-1',
        label: 'flow-1',
        cityId: 'city-1',
        sourceBuilding: 'b-in1',
        targetBuildings: ['b-out'],
        waypoints: [[7, 0.5, 7], [7, 0.5, 14], [13, 0.5, 18.5]],
        color: '#E84D8A',
        pipeWidth: 0.3,
        directed: true,
      },
      {
        id: 'pipe-2',
        label: 'flow-2',
        cityId: 'city-1',
        sourceBuilding: 'b-in2',
        targetBuildings: ['b-out'],
        waypoints: [[19, 0.5, 7], [19, 0.5, 14], [13, 0.5, 18.5]],
        color: '#E84D8A',
        pipeWidth: 0.3,
        directed: true,
      },
    ],
    districts: [],
  };
}

/** Full scene — multiple cities, roads, pipes, districts */
export function fullSceneMap(): IsoMap {
  const twoCities = twoCitiesWithRoadMap();
  const withPipes = cityWithPipelinesMap();

  return {
    version: 1,
    bounds: { minX: 0, maxX: 80, minZ: 0, maxZ: 60 },
    cities: [
      ...twoCities.cities,
      {
        ...withPipes.cities[0],
        id: 'city-proc',
        x: 20, z: 32,
      },
    ],
    buildings: [
      ...twoCities.buildings,
      ...withPipes.buildings.map(b => ({
        ...b,
        cityId: 'city-proc',
        worldX: b.worldX + 18,
        worldZ: b.worldZ + 30,
      })),
    ],
    roads: [
      ...twoCities.roads,
      {
        sourceCityId: 'city-b',
        targetCityId: 'city-proc',
        waypoints: [[48, 0.04, 28], [48, 0.04, 32], [46, 0.04, 36]],
        width: 1,
        intensity: 0.3,
        category: 'secondary',
        color: '#1ABC9C',
      },
    ],
    pipelines: withPipes.pipelines.map(p => ({
      ...p,
      cityId: 'city-proc',
      waypoints: p.waypoints.map(([x, y, z]) => [x + 18, y, z + 30] as [number, number, number]),
    })),
    districts: [{
      id: 'dist-1',
      label: 'Zone A',
      x: 0, z: 0, width: 35, depth: 30,
    }],
  };
}

/** Generates a stress-test map with N buildings */
export function stressTestMap(buildingCount: number): IsoMap {
  const cols = Math.ceil(Math.sqrt(buildingCount));
  const spacing = 6;
  const cityWidth = cols * spacing + 4;
  const colors = ['#F2D024', '#E84D8A', '#56B870', '#4A90D9', '#E67E22', '#1ABC9C', '#9B59B6', '#3498DB'];

  const buildings: MapBuilding[] = [];
  for (let i = 0; i < buildingCount; i++) {
    const col = i % cols;
    const row = Math.floor(i / cols);
    buildings.push({
      id: `b-${i}`,
      label: `unit_${i}`,
      category: 'unit',
      color: colors[i % colors.length],
      worldX: 4 + col * spacing,
      worldZ: 4 + row * spacing,
      width: 3, depth: 2, height: 1 + Math.random() * 3,
      importance: Math.random(),
      cityId: 'stress-city',
    });
  }

  return {
    version: 1,
    bounds: { minX: 0, maxX: cityWidth + 4, minZ: 0, maxZ: cityWidth + 4 },
    cities: [{
      id: 'stress-city',
      label: 'Stress',
      category: 'primary',
      x: 0, z: 0, width: cityWidth + 4, depth: cityWidth + 4,
      isFocus: true,
      importance: 0.5,
      inputPorts: [],
      outputPorts: [],
      grid: {
        cols, rows: Math.ceil(buildingCount / cols),
        colX: Array.from({ length: cols }, (_, i) => 4 + i * spacing),
        rowZ: Array.from({ length: Math.ceil(buildingCount / cols) }, (_, i) => 4 + i * spacing),
        colWidths: Array(cols).fill(spacing - 1),
        rowHeights: Array(Math.ceil(buildingCount / cols)).fill(spacing - 1),
      },
      subPlatforms: [],
    }],
    buildings,
    roads: [],
    pipelines: [],
    districts: [],
  };
}
