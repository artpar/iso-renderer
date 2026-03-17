import { describe, it, expect } from 'vitest';
import { createCanvas } from 'canvas';
import { renderOverlays } from './overlays';
import { singleBuildingMap, threeBuildingsMap } from '../test/fixtures';
import { matchesSnapshot } from '../test/visual';
import type { Viewport, RenderState } from '../types';

const vp: Viewport = { width: 800, height: 600, zoom: 8, offsetX: 0, offsetY: 0 };

describe('overlays layer', () => {
  it('renders selection glow around selected building', () => {
    const canvas = createCanvas(800, 600);
    const ctx = canvas.getContext('2d');
    const map = singleBuildingMap();

    ctx.fillStyle = '#1a1a1a';
    ctx.fillRect(0, 0, 800, 600);
    renderOverlays(ctx as unknown as CanvasRenderingContext2D, map, vp,
      { selectedId: 'b-1', hoveredId: null, highlightedIds: new Set() });

    const result = matchesSnapshot('layer-overlays-selected', canvas);
    expect(result.pass).toBe(true);
  });

  it('renders hover highlight', () => {
    const canvas = createCanvas(800, 600);
    const ctx = canvas.getContext('2d');
    const map = singleBuildingMap();

    ctx.fillStyle = '#1a1a1a';
    ctx.fillRect(0, 0, 800, 600);
    renderOverlays(ctx as unknown as CanvasRenderingContext2D, map, vp,
      { selectedId: null, hoveredId: 'b-1', highlightedIds: new Set() });

    const result = matchesSnapshot('layer-overlays-hovered', canvas);
    expect(result.pass).toBe(true);
  });

  it('dims non-highlighted buildings', () => {
    const canvas = createCanvas(800, 600);
    const ctx = canvas.getContext('2d');
    const map = threeBuildingsMap();

    ctx.fillStyle = '#1a1a1a';
    ctx.fillRect(0, 0, 800, 600);
    renderOverlays(ctx as unknown as CanvasRenderingContext2D, map, vp,
      { selectedId: null, hoveredId: null, highlightedIds: new Set(['b-add']) });

    const result = matchesSnapshot('layer-overlays-highlighted', canvas);
    expect(result.pass).toBe(true);
  });

  it('renders nothing when no interaction state', () => {
    const canvas = createCanvas(800, 600);
    const ctx = canvas.getContext('2d');
    const map = singleBuildingMap();

    ctx.fillStyle = '#1a1a1a';
    ctx.fillRect(0, 0, 800, 600);
    renderOverlays(ctx as unknown as CanvasRenderingContext2D, map, vp,
      { selectedId: null, hoveredId: null, highlightedIds: new Set() });

    // Should be just background
    const data = ctx.getImageData(0, 0, 800, 600).data;
    let nonBgPixels = 0;
    for (let i = 0; i < data.length; i += 4) {
      if (data[i] !== 0x1a || data[i + 1] !== 0x1a || data[i + 2] !== 0x1a) {
        nonBgPixels++;
      }
    }
    expect(nonBgPixels).toBe(0);
  });
});
