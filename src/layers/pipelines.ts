import { PIPELINE_ALPHA, darken, brighten, withAlpha } from '../constants';
import { worldToScreen } from '../engine/projection';
import { fillPoly } from '../engine/iso-utils';
import type { IsoMap, Viewport, RenderState } from '../types';

/**
 * Render intra-city pipelines as 3D isometric tubes.
 * Each segment is a small extruded box with visible faces.
 */
export function renderPipelines(
  ctx: CanvasRenderingContext2D,
  map: IsoMap,
  vp: Viewport,
  _state: RenderState,
): void {
  for (const pipe of map.pipelines) {
    if (pipe.waypoints.length < 2) continue;

    const halfWidth = Math.max(0.25, pipe.pipeWidth * 0.8);
    const pipeHeight = Math.max(0.2, pipe.pipeWidth * 0.8);
    const color = pipe.color;

    for (let i = 0; i < pipe.waypoints.length - 1; i++) {
      const [x1, y1, z1] = pipe.waypoints[i];
      const [x2, y2, z2] = pipe.waypoints[i + 1];
      drawPipeSegment(ctx, vp, x1, y1, z1, x2, y2, z2, halfWidth, pipeHeight, color);
    }

    // Direction arrows
    if (pipe.directed && pipe.waypoints.length >= 2) {
      for (let i = 0; i < pipe.waypoints.length - 1; i++) {
        const [x1, y1, z1] = pipe.waypoints[i];
        const [x2, y2, z2] = pipe.waypoints[i + 1];
        drawPipeArrow(ctx, vp, x1, y1, z1, x2, y2, z2, pipeHeight, color);
      }
    }
  }
}

/** Draw a single pipe segment as a 3D extruded box */
function drawPipeSegment(
  ctx: CanvasRenderingContext2D,
  vp: Viewport,
  x1: number, y1: number, z1: number,
  x2: number, y2: number, z2: number,
  halfWidth: number,
  height: number,
  color: string,
): void {
  const dx = x2 - x1;
  const dz = z2 - z1;
  const len = Math.sqrt(dx * dx + dz * dz);
  if (len < 0.01) return;

  // Perpendicular normal in XZ plane
  const nx = -dz / len * halfWidth;
  const nz = dx / len * halfWidth;

  const baseY = Math.min(y1, y2);
  const topY = baseY + height;
  const alpha = PIPELINE_ALPHA;

  // Top face
  const topFace = [
    worldToScreen(x1 - nx, topY, z1 - nz, vp),
    worldToScreen(x1 + nx, topY, z1 + nz, vp),
    worldToScreen(x2 + nx, topY, z2 + nz, vp),
    worldToScreen(x2 - nx, topY, z2 - nz, vp),
  ];

  // Side faces
  const leftFace = [
    worldToScreen(x1 - nx, topY, z1 - nz, vp),
    worldToScreen(x2 - nx, topY, z2 - nz, vp),
    worldToScreen(x2 - nx, baseY, z2 - nz, vp),
    worldToScreen(x1 - nx, baseY, z1 - nz, vp),
  ];

  const rightFace = [
    worldToScreen(x2 + nx, topY, z2 + nz, vp),
    worldToScreen(x1 + nx, topY, z1 + nz, vp),
    worldToScreen(x1 + nx, baseY, z1 + nz, vp),
    worldToScreen(x2 + nx, baseY, z2 + nz, vp),
  ];

  // Draw faces
  fillPoly(ctx, leftFace, withAlpha(darken(color, 0.3), alpha * 0.7));
  fillPoly(ctx, rightFace, withAlpha(darken(color, 0.4), alpha * 0.7));
  fillPoly(ctx, topFace, withAlpha(brighten(color, 0.15), alpha));

  // Subtle top outline
  ctx.beginPath();
  ctx.moveTo(topFace[0].x, topFace[0].y);
  for (let i = 1; i < topFace.length; i++) {
    ctx.lineTo(topFace[i].x, topFace[i].y);
  }
  ctx.closePath();
  ctx.strokeStyle = withAlpha(color, 0.25);
  ctx.lineWidth = 0.5;
  ctx.stroke();
}

/** Draw a direction arrow sitting on top of the pipe at segment midpoint */
function drawPipeArrow(
  ctx: CanvasRenderingContext2D,
  vp: Viewport,
  x1: number, y1: number, z1: number,
  x2: number, y2: number, z2: number,
  height: number,
  color: string,
): void {
  const mx = (x1 + x2) / 2;
  const mz = (z1 + z2) / 2;
  const my = Math.min(y1, y2) + height + 0.02;

  const dx = x2 - x1;
  const dz = z2 - z1;
  const len = Math.sqrt(dx * dx + dz * dz);
  if (len < 0.5) return;

  const nx = dx / len;
  const nz = dz / len;
  const arrowLen = Math.min(0.8, len * 0.25);

  const tip = worldToScreen(mx + nx * arrowLen, my, mz + nz * arrowLen, vp);
  const baseL = worldToScreen(
    mx - nx * arrowLen * 0.3 + nz * arrowLen * 0.5,
    my,
    mz - nz * arrowLen * 0.3 - nx * arrowLen * 0.5,
    vp,
  );
  const baseR = worldToScreen(
    mx - nx * arrowLen * 0.3 - nz * arrowLen * 0.5,
    my,
    mz - nz * arrowLen * 0.3 + nx * arrowLen * 0.5,
    vp,
  );

  ctx.beginPath();
  ctx.moveTo(tip.x, tip.y);
  ctx.lineTo(baseL.x, baseL.y);
  ctx.lineTo(baseR.x, baseR.y);
  ctx.closePath();
  ctx.fillStyle = withAlpha(brighten(color, 0.3), 0.85);
  ctx.fill();
}
