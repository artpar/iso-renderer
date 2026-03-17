import { FACE, OVERLAY, brighten, darken, withAlpha } from '../constants';
import { depthSort } from '../engine/painter';
import { isoTopFace, isoLeftFace, isoRightFace, fillPoly, strokePoly } from '../engine/iso-utils';
import type { IsoMap, MapBuilding, Viewport, RenderState } from '../types';

/** Render all buildings as isometric 3-face boxes, depth-sorted */
export function renderBuildings(
  ctx: CanvasRenderingContext2D,
  map: IsoMap,
  vp: Viewport,
  state: RenderState,
): void {
  const sorted = depthSort(
    map.buildings.map(b => ({
      ...b,
      id: b.id,
      worldX: b.worldX,
      worldZ: b.worldZ,
      worldY: 0,
    })),
  );

  for (const b of sorted) {
    drawBuilding(ctx, b, vp, state);
  }
}

function drawBuilding(
  ctx: CanvasRenderingContext2D,
  b: MapBuilding,
  vp: Viewport,
  state: RenderState,
): void {
  const baseColor = b.color;
  const isSelected = state.selectedId === b.id;
  const isHovered = state.hoveredId === b.id;
  const hasHighlights = state.highlightedIds.size > 0;
  const isHighlighted = state.highlightedIds.has(b.id);

  let topColor = brighten(baseColor, FACE.topBrighten);
  let leftColor = darken(baseColor, FACE.leftDarken);
  let rightColor = darken(baseColor, FACE.rightDarken);

  if (isSelected) {
    topColor = brighten(topColor, 0.3);
    leftColor = brighten(leftColor, 0.2);
    rightColor = brighten(rightColor, 0.15);
  } else if (isHovered) {
    topColor = brighten(topColor, 0.15);
    leftColor = brighten(leftColor, 0.1);
    rightColor = brighten(rightColor, 0.08);
  }

  // Draw the three faces
  const top = isoTopFace(b.worldX, b.worldZ, b.width, b.depth, b.height, vp);
  const left = isoLeftFace(b.worldX, b.worldZ, b.width, b.depth, b.height, vp);
  const right = isoRightFace(b.worldX, b.worldZ, b.width, b.depth, b.height, vp);

  // Left face first (back), then right, then top (front-most)
  fillPoly(ctx, left, leftColor);
  fillPoly(ctx, right, rightColor);
  fillPoly(ctx, top, topColor);

  // Dim non-highlighted buildings when highlighting is active
  if (hasHighlights && !isHighlighted && !isSelected && !isHovered) {
    // Overlay a semi-transparent dark layer
    fillPoly(ctx, left, withAlpha('#000000', 1 - OVERLAY.dimAlpha));
    fillPoly(ctx, right, withAlpha('#000000', 1 - OVERLAY.dimAlpha));
    fillPoly(ctx, top, withAlpha('#000000', 1 - OVERLAY.dimAlpha));
  }

  // Selection border
  if (isSelected) {
    strokePoly(ctx, top, OVERLAY.selected, 2);
    strokePoly(ctx, left, OVERLAY.selected, 1);
    strokePoly(ctx, right, OVERLAY.selected, 1);
  } else if (isHovered) {
    strokePoly(ctx, top, OVERLAY.hovered, 1.5);
  }
}

/** Export for hit-test registration — returns the top face polygon for a building */
export function buildingTopPoly(
  b: MapBuilding,
  vp: Viewport,
): { x: number; y: number }[] {
  return isoTopFace(b.worldX, b.worldZ, b.width, b.depth, b.height, vp);
}
