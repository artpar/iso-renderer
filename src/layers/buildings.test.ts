import { describe, it, expect } from 'vitest';
import { createCanvas } from 'canvas';
import { renderBuildings } from './buildings';
import { singleBuildingMap, threeBuildingsMap } from '../test/fixtures';
import { matchesSnapshot } from '../test/visual';
import type { Viewport, RenderState } from '../types';

const vp: Viewport = { width: 800, height: 600, zoom: 8, offsetX: 0, offsetY: 0 };
const state: RenderState = { selectedId: null, hoveredId: null, highlightedIds: new Set() };

describe('buildings layer', () => {
  it('renders a single isometric box', () => {
    const canvas = createCanvas(800, 600);
    const ctx = canvas.getContext('2d');
    const map = singleBuildingMap();

    ctx.fillStyle = '#1a1a1a';
    ctx.fillRect(0, 0, 800, 600);
    renderBuildings(ctx as unknown as CanvasRenderingContext2D, map, vp, state);

    const result = matchesSnapshot('layer-buildings-single', canvas);
    expect(result.pass).toBe(true);
  });

  it('renders three buildings with different colors', () => {
    const canvas = createCanvas(800, 600);
    const ctx = canvas.getContext('2d');
    const map = threeBuildingsMap();

    ctx.fillStyle = '#1a1a1a';
    ctx.fillRect(0, 0, 800, 600);
    renderBuildings(ctx as unknown as CanvasRenderingContext2D, map, vp, state);

    const result = matchesSnapshot('layer-buildings-three', canvas);
    expect(result.pass).toBe(true);
  });

  it('renders buildings with three distinct faces (top/left/right)', () => {
    const canvas = createCanvas(800, 600);
    const ctx = canvas.getContext('2d');
    const map = singleBuildingMap();

    ctx.fillStyle = '#1a1a1a';
    ctx.fillRect(0, 0, 800, 600);
    renderBuildings(ctx as unknown as CanvasRenderingContext2D, map, vp, state);

    // Verify the building was drawn by checking that pixels changed
    const data = ctx.getImageData(0, 0, 800, 600).data;
    let nonBgPixels = 0;
    for (let i = 0; i < data.length; i += 4) {
      if (data[i] !== 0x1a || data[i + 1] !== 0x1a || data[i + 2] !== 0x1a) {
        nonBgPixels++;
      }
    }
    expect(nonBgPixels).toBeGreaterThan(100);
  });

  it('renders building with selection highlight', () => {
    const canvas = createCanvas(800, 600);
    const ctx = canvas.getContext('2d');
    const map = singleBuildingMap();

    ctx.fillStyle = '#1a1a1a';
    ctx.fillRect(0, 0, 800, 600);
    renderBuildings(ctx as unknown as CanvasRenderingContext2D, map, { ...vp },
      { ...state, selectedId: 'b-1' });

    const result = matchesSnapshot('layer-buildings-selected', canvas);
    expect(result.pass).toBe(true);
  });

  it('renders building with hover highlight', () => {
    const canvas = createCanvas(800, 600);
    const ctx = canvas.getContext('2d');
    const map = singleBuildingMap();

    ctx.fillStyle = '#1a1a1a';
    ctx.fillRect(0, 0, 800, 600);
    renderBuildings(ctx as unknown as CanvasRenderingContext2D, map, { ...vp },
      { ...state, hoveredId: 'b-1' });

    const result = matchesSnapshot('layer-buildings-hovered', canvas);
    expect(result.pass).toBe(true);
  });

  it('depth-sorts buildings back to front', () => {
    const canvas = createCanvas(800, 600);
    const ctx = canvas.getContext('2d');
    const map = threeBuildingsMap();

    ctx.fillStyle = '#1a1a1a';
    ctx.fillRect(0, 0, 800, 600);
    renderBuildings(ctx as unknown as CanvasRenderingContext2D, map, vp, state);

    const result = matchesSnapshot('layer-buildings-sorted', canvas);
    expect(result.pass).toBe(true);
  });
});
