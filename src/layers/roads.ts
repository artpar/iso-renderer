import { darken, brighten, withAlpha } from '../constants';
import { worldToScreen } from '../engine/projection';
import { fillPoly } from '../engine/iso-utils';
import type { IsoMap, Viewport, RenderState } from '../types';

/**
 * Render inter-city roads as 3D isometric ribbons.
 * Each road segment is a flat extruded box lying on the ground plane.
 */
export function renderRoads(
  ctx: CanvasRenderingContext2D,
  map: IsoMap,
  vp: Viewport,
  _state: RenderState,
): void {
  for (const road of map.roads) {
    if (road.waypoints.length < 2) continue;

    const roadWidth = Math.max(0.3, 0.15 + Math.log2(1 + road.width) * 0.35);
    const roadHeight = 0.08 + road.intensity * 0.15;
    const color = road.color;

    for (let i = 0; i < road.waypoints.length - 1; i++) {
      const [x1, y1, z1] = road.waypoints[i];
      const [x2, y2, z2] = road.waypoints[i + 1];
      drawRoadSegment(ctx, vp, x1, y1, z1, x2, y2, z2, roadWidth, roadHeight, color);
    }

    // Direction arrow at midpoint
    if (road.waypoints.length >= 2) {
      const midIdx = Math.floor(road.waypoints.length / 2);
      const [ax, ay, az] = road.waypoints[midIdx - 1];
      const [bx, by, bz] = road.waypoints[midIdx];
      drawRoadArrow(ctx, vp, ax, ay, az, bx, by, bz, roadHeight, color);
    }
  }
}

/** Draw a single road segment as a 3D isometric box between two world points */
function drawRoadSegment(
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

  // Normal perpendicular to road direction (in XZ plane)
  const nx = -dz / len * halfWidth;
  const nz = dx / len * halfWidth;

  const baseY = Math.min(y1, y2);
  const topY = baseY + height;

  // Top face (4 corners of the road ribbon at height)
  const topFace = [
    worldToScreen(x1 - nx, topY, z1 - nz, vp),
    worldToScreen(x1 + nx, topY, z1 + nz, vp),
    worldToScreen(x2 + nx, topY, z2 + nz, vp),
    worldToScreen(x2 - nx, topY, z2 - nz, vp),
  ];

  // Determine which side faces are visible based on road direction
  // Left side face (facing camera-left)
  const leftFace = [
    worldToScreen(x1 - nx, topY, z1 - nz, vp),
    worldToScreen(x2 - nx, topY, z2 - nz, vp),
    worldToScreen(x2 - nx, baseY, z2 - nz, vp),
    worldToScreen(x1 - nx, baseY, z1 - nz, vp),
  ];

  // Right side face
  const rightFace = [
    worldToScreen(x2 + nx, topY, z2 + nz, vp),
    worldToScreen(x1 + nx, topY, z1 + nz, vp),
    worldToScreen(x1 + nx, baseY, z1 + nz, vp),
    worldToScreen(x2 + nx, baseY, z2 + nz, vp),
  ];

  // Front face (end cap)
  const frontFace = [
    worldToScreen(x2 - nx, topY, z2 - nz, vp),
    worldToScreen(x2 + nx, topY, z2 + nz, vp),
    worldToScreen(x2 + nx, baseY, z2 + nz, vp),
    worldToScreen(x2 - nx, baseY, z2 - nz, vp),
  ];

  // Draw faces back-to-front for correct layering
  // Side faces first (darker), then top (brightest)
  fillPoly(ctx, leftFace, withAlpha(darken(color, 0.4), 0.45));
  fillPoly(ctx, rightFace, withAlpha(darken(color, 0.5), 0.45));
  fillPoly(ctx, frontFace, withAlpha(darken(color, 0.45), 0.45));
  fillPoly(ctx, topFace, withAlpha(darken(color, 0.15), 0.55));

  // Top face outline for definition
  ctx.beginPath();
  ctx.moveTo(topFace[0].x, topFace[0].y);
  for (let i = 1; i < topFace.length; i++) {
    ctx.lineTo(topFace[i].x, topFace[i].y);
  }
  ctx.closePath();
  ctx.strokeStyle = withAlpha(color, 0.15);
  ctx.lineWidth = 0.5;
  ctx.stroke();
}

/** Draw a direction arrow on the road surface at the midpoint */
function drawRoadArrow(
  ctx: CanvasRenderingContext2D,
  vp: Viewport,
  x1: number, y1: number, z1: number,
  x2: number, y2: number, z2: number,
  height: number,
  color: string,
): void {
  const mx = (x1 + x2) / 2;
  const mz = (z1 + z2) / 2;
  const my = Math.min(y1, y2) + height + 0.01;

  const dx = x2 - x1;
  const dz = z2 - z1;
  const len = Math.sqrt(dx * dx + dz * dz);
  if (len < 0.5) return;

  const nx = dx / len;
  const nz = dz / len;
  const arrowLen = Math.min(1.2, len * 0.3);

  // Arrow tip and two base corners
  const tip = worldToScreen(mx + nx * arrowLen, my, mz + nz * arrowLen, vp);
  const baseL = worldToScreen(
    mx - nx * arrowLen * 0.3 + nz * arrowLen * 0.4,
    my,
    mz - nz * arrowLen * 0.3 - nx * arrowLen * 0.4,
    vp,
  );
  const baseR = worldToScreen(
    mx - nx * arrowLen * 0.3 - nz * arrowLen * 0.4,
    my,
    mz - nz * arrowLen * 0.3 + nx * arrowLen * 0.4,
    vp,
  );

  ctx.beginPath();
  ctx.moveTo(tip.x, tip.y);
  ctx.lineTo(baseL.x, baseL.y);
  ctx.lineTo(baseR.x, baseR.y);
  ctx.closePath();
  ctx.fillStyle = withAlpha(color, 0.6);
  ctx.fill();
}
