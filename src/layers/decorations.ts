import { ZOOM, withAlpha } from '../constants';
import { worldToScreen } from '../engine/projection';
import { isoTopFace } from '../engine/iso-utils';
import type { IsoMap, MapBuilding, BuildingDecoration, Viewport, RenderState } from '../types';

/** Render building decorations: studs, docks, stripes, markers, badges */
export function renderDecorations(
  ctx: CanvasRenderingContext2D,
  map: IsoMap,
  vp: Viewport,
  _state: RenderState,
): void {
  if (vp.zoom < ZOOM.detailThreshold) return;

  for (const b of map.buildings) {
    if (!b.decorations || b.decorations.length === 0) continue;

    for (const deco of b.decorations) {
      switch (deco.kind) {
        case 'stud':
          drawStuds(ctx, b, deco, vp);
          break;
        case 'dock':
          drawDocks(ctx, b, deco, vp);
          break;
        case 'stripe':
          drawStripes(ctx, b, deco, vp);
          break;
        case 'marker':
          drawMarker(ctx, b, deco, vp);
          break;
        case 'badge':
          drawBadge(ctx, b, deco, vp);
          break;
      }
    }
  }
}

/** Studs on top face — small circles (like Lego) */
function drawStuds(
  ctx: CanvasRenderingContext2D,
  b: MapBuilding,
  deco: BuildingDecoration,
  vp: Viewport,
): void {
  const count = deco.count || 1;
  const top = isoTopFace(b.worldX, b.worldZ, b.width, b.depth, b.height, vp);

  // Center of top face
  const cx = (top[0].x + top[1].x + top[2].x + top[3].x) / 4;
  const cy = (top[0].y + top[1].y + top[2].y + top[3].y) / 4;

  const studRadius = Math.max(2, 3 * vp.zoom * 0.15);
  const spacing = studRadius * 3;
  const startX = cx - ((count - 1) * spacing) / 2;

  for (let i = 0; i < count; i++) {
    const sx = startX + i * spacing;
    ctx.beginPath();
    ctx.arc(sx, cy, studRadius, 0, Math.PI * 2);
    ctx.fillStyle = deco.color;
    ctx.fill();
    ctx.strokeStyle = withAlpha(deco.color, 0.5);
    ctx.lineWidth = 0.5;
    ctx.stroke();
  }
}

/** Docks on side faces — small rectangles protruding from the face */
function drawDocks(
  ctx: CanvasRenderingContext2D,
  b: MapBuilding,
  deco: BuildingDecoration,
  vp: Viewport,
): void {
  const count = deco.count || 1;
  const dockSize = Math.max(2, 2 * vp.zoom * 0.15);

  for (let i = 0; i < count; i++) {
    const t = (i + 0.5) / count;
    let px: number, py: number;

    if (deco.face === 'left') {
      const worldZ = b.worldZ + b.depth * t;
      const worldY = b.height * 0.5;
      const s = worldToScreen(b.worldX, worldY, worldZ, vp);
      px = s.x - dockSize;
      py = s.y;
    } else {
      const worldZ = b.worldZ + b.depth * t;
      const worldY = b.height * 0.5;
      const s = worldToScreen(b.worldX + b.width, worldY, worldZ, vp);
      px = s.x + dockSize;
      py = s.y;
    }

    ctx.fillStyle = deco.color;
    ctx.fillRect(px - dockSize / 2, py - dockSize / 2, dockSize, dockSize);
  }
}

/** Stripes on top face — colored lines across the top */
function drawStripes(
  ctx: CanvasRenderingContext2D,
  b: MapBuilding,
  deco: BuildingDecoration,
  vp: Viewport,
): void {
  const count = deco.count || 2;
  const top = isoTopFace(b.worldX, b.worldZ, b.width, b.depth, b.height, vp);

  for (let i = 0; i < count; i++) {
    const t = (i + 1) / (count + 1);
    // Interpolate along the top face edges
    const p1x = top[0].x + (top[3].x - top[0].x) * t;
    const p1y = top[0].y + (top[3].y - top[0].y) * t;
    const p2x = top[1].x + (top[2].x - top[1].x) * t;
    const p2y = top[1].y + (top[2].y - top[1].y) * t;

    ctx.beginPath();
    ctx.moveTo(p1x, p1y);
    ctx.lineTo(p2x, p2y);
    ctx.strokeStyle = withAlpha(deco.color, 0.6);
    ctx.lineWidth = Math.max(1, vp.zoom * 0.15);
    ctx.stroke();
  }
}

/** Marker — a small icon at a position on the building */
function drawMarker(
  ctx: CanvasRenderingContext2D,
  b: MapBuilding,
  deco: BuildingDecoration,
  vp: Viewport,
): void {
  const pos = deco.position ?? 0.5;
  const screen = worldToScreen(
    b.worldX + b.width * pos,
    b.height + 1,
    b.worldZ + b.depth * 0.5,
    vp,
  );
  const size = Math.max(3, 4 * vp.zoom * 0.15);

  ctx.beginPath();
  ctx.arc(screen.x, screen.y, size, 0, Math.PI * 2);
  ctx.fillStyle = deco.color;
  ctx.fill();
}

/** Badge — a text label decoration */
function drawBadge(
  ctx: CanvasRenderingContext2D,
  b: MapBuilding,
  deco: BuildingDecoration,
  vp: Viewport,
): void {
  if (!deco.label) return;

  const screen = worldToScreen(
    b.worldX + b.width / 2,
    b.height + 1.5,
    b.worldZ + b.depth / 2,
    vp,
  );

  const fontSize = Math.max(7, 8 * vp.zoom * 0.12);
  ctx.font = `${fontSize}px sans-serif`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'bottom';
  ctx.fillStyle = deco.color;
  ctx.fillText(deco.label, screen.x, screen.y);
}
