import { CITY } from '../constants';
import { isoGroundQuad, fillPoly, strokePoly } from '../engine/iso-utils';
import type { IsoMap, Viewport, RenderState } from '../types';

/** Render city platforms and sub-platforms as flat isometric quads */
export function renderGround(
  ctx: CanvasRenderingContext2D,
  map: IsoMap,
  vp: Viewport,
  _state: RenderState,
): void {
  // Sort cities back-to-front
  const sorted = map.cities.slice().sort((a, b) => (a.x + a.z) - (b.x + b.z));

  for (const city of sorted) {
    const groundColor = city.isFocus ? CITY.groundFocus : CITY.ground;
    const borderColor = city.isFocus ? CITY.borderFocus : CITY.border;

    // Main platform
    const quad = isoGroundQuad(city.x, city.z, city.width, city.depth, vp);
    fillPoly(ctx, quad, groundColor);
    strokePoly(ctx, quad, borderColor, city.isFocus ? 2 : 1);

    // Sub-platforms
    for (const sub of city.subPlatforms) {
      const subQuad = isoGroundQuad(sub.x, sub.z, sub.width, sub.depth, vp);
      fillPoly(ctx, subQuad, CITY.groundFocus);
      strokePoly(ctx, subQuad, CITY.border, 1);
    }
  }

  // Districts (background tints)
  for (const dist of map.districts) {
    const quad = isoGroundQuad(dist.x, dist.z, dist.width, dist.depth, vp);
    const color = dist.color || 'rgba(255,255,255,0.03)';
    fillPoly(ctx, quad, color);
    strokePoly(ctx, quad, 'rgba(255,255,255,0.08)', 1);
  }
}
