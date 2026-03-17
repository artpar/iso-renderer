import { CITY, ZOOM } from '../constants';
import { worldToScreen } from '../engine/projection';
import type { IsoMap, Viewport, RenderState } from '../types';

/** Render text labels for cities and buildings */
export function renderLabels(
  ctx: CanvasRenderingContext2D,
  map: IsoMap,
  vp: Viewport,
  _state: RenderState,
): void {
  if (vp.zoom < ZOOM.labelThreshold) return;

  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';

  // City labels (larger, above the platform)
  const cityFontSize = Math.max(10, Math.min(16, 12 * vp.zoom * 0.5));
  ctx.font = `bold ${cityFontSize}px sans-serif`;
  ctx.fillStyle = CITY.text;

  for (const city of map.cities) {
    const cx = city.x + city.width / 2;
    const cz = city.z;
    const screen = worldToScreen(cx, 0.5, cz - 1, vp);
    ctx.fillText(city.label, screen.x, screen.y);
  }

  // Building labels (smaller, on top of building)
  const buildFontSize = Math.max(8, Math.min(12, 10 * vp.zoom * 0.4));
  ctx.font = `${buildFontSize}px sans-serif`;
  ctx.fillStyle = CITY.textDim;

  for (const b of map.buildings) {
    // Check if building is large enough in screen space
    const screenSize = b.width * vp.zoom * 0.866; // approximate screen width
    if (screenSize < 20) continue;

    const cx = b.worldX + b.width / 2;
    const cz = b.worldZ + b.depth / 2;
    const screen = worldToScreen(cx, b.height + 0.5, cz, vp);

    // Truncate label if too long
    const maxChars = Math.floor(screenSize / (buildFontSize * 0.5));
    const label = b.label.length > maxChars ? b.label.slice(0, maxChars - 1) + '…' : b.label;

    ctx.fillText(label, screen.x, screen.y);
  }
}
