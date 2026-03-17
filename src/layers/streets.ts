import { CITY } from '../constants';
import { isoLine, isoGroundQuad, strokePoly } from '../engine/iso-utils';
import type { IsoMap, Viewport, RenderState } from '../types';

/** Render internal grid lines and city perimeters */
export function renderStreets(
  ctx: CanvasRenderingContext2D,
  map: IsoMap,
  vp: Viewport,
  _state: RenderState,
): void {
  for (const city of map.cities) {
    // City perimeter
    const perim = isoGroundQuad(city.x, city.z, city.width, city.depth, vp);
    strokePoly(ctx, perim, city.isFocus ? CITY.borderFocus : CITY.border, city.isFocus ? 2 : 1);

    const grid = city.grid;

    // Vertical grid lines (along Z axis)
    for (let i = 1; i < grid.cols; i++) {
      const gx = grid.colX[i];
      isoLine(ctx,
        gx, 0, city.z,
        gx, 0, city.z + city.depth,
        vp, CITY.gridLine, 0.5,
      );
    }

    // Horizontal grid lines (along X axis)
    for (let i = 1; i < grid.rows; i++) {
      const gz = grid.rowZ[i];
      isoLine(ctx,
        city.x, 0, gz,
        city.x + city.width, 0, gz,
        vp, CITY.gridLine, 0.5,
      );
    }

    // Sub-platform perimeters
    for (const sub of city.subPlatforms) {
      const subPerim = isoGroundQuad(sub.x, sub.z, sub.width, sub.depth, vp);
      strokePoly(ctx, subPerim, CITY.border, 1);
    }
  }
}
