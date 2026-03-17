// Public API
export { IsoEngine } from './engine/iso-engine';
export type { IsoEngineConfig } from './engine/iso-engine';

// Types
export type {
  IsoMap,
  MapBounds,
  MapCity,
  MapGrid,
  MapSubPlatform,
  MapBuilding,
  BuildingDecoration,
  MapRoad,
  MapPipeline,
  MapPort,
  MapDistrict,
  RenderState,
  Viewport,
  IsoCallbacks,
} from './types';

// Projection utilities (for consumers doing overlay positioning)
export { worldToScreen, screenToWorld } from './engine/projection';

// Color utilities
export { brighten, darken, withAlpha, hexToRgb, rgbToHex } from './constants';
