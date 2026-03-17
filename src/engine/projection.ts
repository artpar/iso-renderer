import { ISO } from '../constants';
import type { Viewport } from '../types';

/**
 * Project a 3D world point to 2D screen coordinates.
 * Standard isometric projection (30° from horizontal).
 */
export function worldToScreen(
  worldX: number,
  worldY: number,
  worldZ: number,
  vp: Viewport,
): { x: number; y: number } {
  return {
    x: vp.width / 2 + (worldX - worldZ) * ISO.cos30 * vp.zoom + vp.offsetX,
    y: vp.height / 2 + (worldX + worldZ) * ISO.sin30 * vp.zoom - worldY * vp.zoom + vp.offsetY,
  };
}

/**
 * Inverse projection: screen point to world XZ plane (Y=0).
 */
export function screenToWorld(
  screenX: number,
  screenY: number,
  vp: Viewport,
): { x: number; z: number } {
  // Remove offset and center
  const sx = (screenX - vp.width / 2 - vp.offsetX) / vp.zoom;
  const sy = (screenY - vp.height / 2 - vp.offsetY) / vp.zoom;

  // Invert the iso matrix:
  // sx = (worldX - worldZ) * cos30
  // sy = (worldX + worldZ) * sin30
  // Solve for worldX and worldZ:
  const worldX = sx / (2 * ISO.cos30) + sy / (2 * ISO.sin30);
  const worldZ = -sx / (2 * ISO.cos30) + sy / (2 * ISO.sin30);

  return { x: worldX, z: worldZ };
}
