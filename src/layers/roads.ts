import { withAlpha } from '../constants';
import { worldToScreen } from '../engine/projection';
import type { IsoMap, Viewport, RenderState } from '../types';

/** Render inter-city roads as colored polylines */
export function renderRoads(
  ctx: CanvasRenderingContext2D,
  map: IsoMap,
  vp: Viewport,
  _state: RenderState,
): void {
  for (const road of map.roads) {
    if (road.waypoints.length < 2) continue;

    const screenPts = road.waypoints.map(([x, y, z]) => worldToScreen(x, y, z, vp));
    const lineWidth = Math.max(1, road.width * vp.zoom * 0.5);

    // Road shadow
    ctx.beginPath();
    ctx.moveTo(screenPts[0].x + 1, screenPts[0].y + 1);
    for (let i = 1; i < screenPts.length; i++) {
      ctx.lineTo(screenPts[i].x + 1, screenPts[i].y + 1);
    }
    ctx.strokeStyle = 'rgba(0,0,0,0.3)';
    ctx.lineWidth = lineWidth + 1;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.stroke();

    // Road line
    ctx.beginPath();
    ctx.moveTo(screenPts[0].x, screenPts[0].y);
    for (let i = 1; i < screenPts.length; i++) {
      ctx.lineTo(screenPts[i].x, screenPts[i].y);
    }
    ctx.strokeStyle = withAlpha(road.color, 0.5 + road.intensity * 0.5);
    ctx.lineWidth = lineWidth;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.stroke();

    // Direction arrow at midpoint
    if (screenPts.length >= 2) {
      const midIdx = Math.floor(screenPts.length / 2);
      const from = screenPts[midIdx - 1];
      const to = screenPts[midIdx];
      drawArrow(ctx, from, to, road.color, lineWidth);
    }
  }
}

function drawArrow(
  ctx: CanvasRenderingContext2D,
  from: { x: number; y: number },
  to: { x: number; y: number },
  color: string,
  lineWidth: number,
): void {
  const dx = to.x - from.x;
  const dy = to.y - from.y;
  const len = Math.sqrt(dx * dx + dy * dy);
  if (len < 5) return;

  const nx = dx / len;
  const ny = dy / len;
  const mx = (from.x + to.x) / 2;
  const my = (from.y + to.y) / 2;
  const arrowSize = Math.max(4, lineWidth * 2);

  ctx.beginPath();
  ctx.moveTo(mx + nx * arrowSize, my + ny * arrowSize);
  ctx.lineTo(mx - nx * arrowSize * 0.5 + ny * arrowSize * 0.5, my - ny * arrowSize * 0.5 - nx * arrowSize * 0.5);
  ctx.lineTo(mx - nx * arrowSize * 0.5 - ny * arrowSize * 0.5, my - ny * arrowSize * 0.5 + nx * arrowSize * 0.5);
  ctx.closePath();
  ctx.fillStyle = color;
  ctx.fill();
}
