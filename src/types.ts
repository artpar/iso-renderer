/**
 * IsoMap — the serializable boundary for the isometric renderer.
 *
 * Domain-agnostic. The renderer knows about cities, buildings, roads, and pipes.
 * It does NOT know about code analysis, types, purity, or any consumer domain.
 * Colors, labels, and categories are passed in by the consumer.
 *
 * All values are primitives (string, number, boolean) or arrays/objects of primitives.
 * JSON.stringify round-trips cleanly. No class instances, no Sets, no circular refs.
 */

export interface IsoMap {
  version: 1;
  bounds: MapBounds;
  cities: MapCity[];
  buildings: MapBuilding[];
  roads: MapRoad[];
  pipelines: MapPipeline[];
  districts: MapDistrict[];
}

export interface MapBounds {
  minX: number;
  maxX: number;
  minZ: number;
  maxZ: number;
}

export interface MapCity {
  id: string;
  label: string;
  category: string;         // consumer-defined category (e.g. 'module', 'service')
  x: number;
  z: number;
  width: number;
  depth: number;
  isFocus: boolean;
  importance: number;        // 0..1
  color?: string;            // platform accent color, falls back to palette
  inputPorts: MapPort[];
  outputPorts: MapPort[];
  grid: MapGrid;
  subPlatforms: MapSubPlatform[];
}

export interface MapGrid {
  cols: number;
  rows: number;
  colX: number[];
  rowZ: number[];
  colWidths: number[];
  rowHeights: number[];
}

export interface MapSubPlatform {
  id: string;
  label: string;
  category: string;
  x: number;
  z: number;
  width: number;
  depth: number;
  grid: MapGrid;
}

export interface MapBuilding {
  id: string;
  label: string;
  category: string;          // consumer-defined (e.g. 'function', 'component')
  color: string;             // hex color — consumer decides mapping
  worldX: number;
  worldZ: number;
  width: number;
  depth: number;
  height: number;
  importance: number;        // 0..1 — drives visual prominence
  /** Arbitrary key-value metadata for tooltips/overlays. Renderer doesn't interpret these. */
  meta?: Record<string, string | number | boolean>;
  cityId: string;
  /** Decorations on the building — studs, stripes, markers */
  decorations?: BuildingDecoration[];
}

/** A visual decoration rendered on a building face */
export interface BuildingDecoration {
  /** Where on the building: 'top', 'left', 'right', 'front', 'back' */
  face: string;
  /** What to render: 'stud', 'stripe', 'dock', 'marker', 'badge' */
  kind: string;
  /** Color for this decoration */
  color: string;
  /** Number of instances (e.g. parameter studs) */
  count?: number;
  /** Relative position 0..1 along the face */
  position?: number;
  /** Label text */
  label?: string;
}

export interface MapRoad {
  sourceCityId: string;
  targetCityId: string;
  waypoints: [number, number, number][];
  /** Visual width multiplier */
  width: number;
  /** Traffic intensity 0..1 — drives visual weight */
  intensity: number;
  /** Consumer-defined category — maps to a color via palette */
  category: string;
  color: string;            // hex color — consumer decides
}

export interface MapPipeline {
  id: string;
  label: string;
  cityId: string;
  sourceBuilding: string | null;
  targetBuildings: string[];
  waypoints: [number, number, number][];
  color: string;            // hex color
  /** Pipe visual width in world units */
  pipeWidth: number;
  /** Show direction arrows */
  directed?: boolean;
}

export interface MapPort {
  name: string;
  color: string;            // hex color
  /** Position along the city face (world units from city origin) */
  x: number;
  /** Width of the port marker */
  width: number;
}

export interface MapDistrict {
  id: string;
  label: string;
  x: number;
  z: number;
  width: number;
  depth: number;
  color?: string;           // optional tint
}

/** Interaction state passed to layers */
export interface RenderState {
  selectedId: string | null;
  hoveredId: string | null;
  highlightedIds: Set<string>;
}

/** Viewport info passed to layers */
export interface Viewport {
  width: number;
  height: number;
  zoom: number;
  offsetX: number;
  offsetY: number;
}

/** Callbacks from engine to consumer */
export interface IsoCallbacks {
  onHover?: (id: string | null) => void;
  onSelect?: (id: string | null) => void;
  onFocus?: (id: string) => void;
}
