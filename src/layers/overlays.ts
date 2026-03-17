import { OVERLAY, withAlpha } from '../constants';
import { isoTopFace, isoLeftFace, isoRightFace, strokePoly, fillPoly } from '../engine/iso-utils';
import type { IsoMap, Viewport, RenderState } from '../types';

/** Render selection glow, hover highlight, and dim-overlay for filtering */
export function renderOverlays(
  ctx: CanvasRenderingContext2D,
  map: IsoMap,
  vp: Viewport,
  state: RenderState,
): void {
  const hasSelection = state.selectedId !== null;
  const hasHover = state.hoveredId !== null;
  const hasHighlights = state.highlightedIds.size > 0;

  if (!hasSelection && !hasHover && !hasHighlights) return;

  for (const b of map.buildings) {
    const isSelected = state.selectedId === b.id;
    const isHovered = state.hoveredId === b.id;
    const isHighlighted = state.highlightedIds.has(b.id);

    if (isSelected) {
      // Glow effect — draw an expanded outline
      const top = isoTopFace(b.worldX, b.worldZ, b.width, b.depth, b.height, vp);
      const left = isoLeftFace(b.worldX, b.worldZ, b.width, b.depth, b.height, vp);
      const right = isoRightFace(b.worldX, b.worldZ, b.width, b.depth, b.height, vp);

      ctx.shadowColor = OVERLAY.selected;
      ctx.shadowBlur = 8;
      strokePoly(ctx, top, OVERLAY.selected, 2.5);
      strokePoly(ctx, left, OVERLAY.selected, 1.5);
      strokePoly(ctx, right, OVERLAY.selected, 1.5);
      ctx.shadowBlur = 0;
    }

    if (isHovered && !isSelected) {
      const top = isoTopFace(b.worldX, b.worldZ, b.width, b.depth, b.height, vp);
      strokePoly(ctx, top, OVERLAY.hovered, 2);
    }

    // Dim non-highlighted when highlighting is active
    if (hasHighlights && !isHighlighted && !isSelected) {
      const top = isoTopFace(b.worldX, b.worldZ, b.width, b.depth, b.height, vp);
      const left = isoLeftFace(b.worldX, b.worldZ, b.width, b.depth, b.height, vp);
      const right = isoRightFace(b.worldX, b.worldZ, b.width, b.depth, b.height, vp);

      const dimColor = withAlpha('#000000', 1 - OVERLAY.dimAlpha);
      fillPoly(ctx, top, dimColor);
      fillPoly(ctx, left, dimColor);
      fillPoly(ctx, right, dimColor);
    }

    // Highlighted glow
    if (isHighlighted && !isSelected) {
      const top = isoTopFace(b.worldX, b.worldZ, b.width, b.depth, b.height, vp);
      strokePoly(ctx, top, OVERLAY.highlighted, 1.5);
    }
  }
}
