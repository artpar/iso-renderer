import { PIPELINE_ALPHA, withAlpha } from '../constants';
import { worldToScreen } from '../engine/projection';
import type { IsoMap, Viewport, RenderState } from '../types';

/** Render intra-city pipelines as colored tubes with optional direction arrows */
export function renderPipelines(
  ctx: CanvasRenderingContext2D,
  map: IsoMap,
  vp: Viewport,
  _state: RenderState,
): void {
  for (const pipe of map.pipelines) {
    if (pipe.waypoints.length < 2) continue;

    const screenPts = pipe.waypoints.map(([x, y, z]) => worldToScreen(x, y, z, vp));
    const lineWidth = Math.max(1, pipe.pipeWidth * vp.zoom * 2);

    // Pipe tube (outer stroke for 3D effect)
    ctx.beginPath();
    ctx.moveTo(screenPts[0].x, screenPts[0].y);
    for (let i = 1; i < screenPts.length; i++) {
      ctx.lineTo(screenPts[i].x, screenPts[i].y);
    }
    ctx.strokeStyle = withAlpha(pipe.color, PIPELINE_ALPHA * 0.5);
    ctx.lineWidth = lineWidth + 2;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.stroke();

    // Inner line (brighter center)
    ctx.beginPath();
    ctx.moveTo(screenPts[0].x, screenPts[0].y);
    for (let i = 1; i < screenPts.length; i++) {
      ctx.lineTo(screenPts[i].x, screenPts[i].y);
    }
    ctx.strokeStyle = withAlpha(pipe.color, PIPELINE_ALPHA);
    ctx.lineWidth = lineWidth;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.stroke();

    // Direction arrows
    if (pipe.directed) {
      for (let i = 1; i < screenPts.length; i++) {
        drawPipeArrow(ctx, screenPts[i - 1], screenPts[i], pipe.color, lineWidth);
      }
    }
  }
}

function drawPipeArrow(
  ctx: CanvasRenderingContext2D,
  from: { x: number; y: number },
  to: { x: number; y: number },
  color: string,
  lineWidth: number,
): void {
  const dx = to.x - from.x;
  const dy = to.y - from.y;
  const len = Math.sqrt(dx * dx + dy * dy);
  if (len < 8) return;

  const nx = dx / len;
  const ny = dy / len;
  const mx = (from.x + to.x) / 2;
  const my = (from.y + to.y) / 2;
  const s = Math.max(3, lineWidth * 1.5);

  ctx.beginPath();
  ctx.moveTo(mx + nx * s, my + ny * s);
  ctx.lineTo(mx - nx * s * 0.4 + ny * s * 0.5, my - ny * s * 0.4 - nx * s * 0.5);
  ctx.lineTo(mx - nx * s * 0.4 - ny * s * 0.5, my - ny * s * 0.4 + nx * s * 0.5);
  ctx.closePath();
  ctx.fillStyle = withAlpha(color, 0.9);
  ctx.fill();
}
