import { describe, it, expect } from 'vitest';
import { createCanvas } from 'canvas';
import { renderDecorations } from './decorations';
import { matchesSnapshot } from '../test/visual';
import type { IsoMap, Viewport, RenderState } from '../types';

const vp: Viewport = { width: 800, height: 600, zoom: 10, offsetX: 0, offsetY: 0 };
const state: RenderState = { selectedId: null, hoveredId: null, highlightedIds: new Set() };

function decoratedBuildingMap(): IsoMap {
  return {
    version: 1,
    bounds: { minX: 0, maxX: 20, minZ: 0, maxZ: 20 },
    cities: [{
      id: 'city-1',
      label: 'Test',
      category: 'primary',
      x: 2, z: 2, width: 16, depth: 16,
      isFocus: true,
      importance: 0.5,
      inputPorts: [],
      outputPorts: [],
      grid: { cols: 1, rows: 1, colX: [4], rowZ: [4], colWidths: [12], rowHeights: [12] },
      subPlatforms: [],
    }],
    buildings: [{
      id: 'b-1',
      label: 'Decorated',
      category: 'unit',
      color: '#E67E22',
      worldX: 6, worldZ: 6, width: 6, depth: 4, height: 4,
      importance: 0.8,
      cityId: 'city-1',
      decorations: [
        { face: 'top', kind: 'stud', color: '#E84D8A', count: 3 },
        { face: 'left', kind: 'dock', color: '#4A90D9', count: 2 },
        { face: 'right', kind: 'dock', color: '#56B870', count: 1 },
        { face: 'top', kind: 'stripe', color: '#F2D024', count: 2 },
      ],
    }],
    roads: [],
    pipelines: [],
    districts: [],
  };
}

describe('decorations layer', () => {
  it('renders studs on building top', () => {
    const canvas = createCanvas(800, 600);
    const ctx = canvas.getContext('2d');
    const map = decoratedBuildingMap();

    ctx.fillStyle = '#1a1a1a';
    ctx.fillRect(0, 0, 800, 600);
    renderDecorations(ctx as unknown as CanvasRenderingContext2D, map, vp, state);

    const result = matchesSnapshot('layer-decorations-studs', canvas);
    expect(result.pass).toBe(true);
  });

  it('renders docks on building sides', () => {
    const canvas = createCanvas(800, 600);
    const ctx = canvas.getContext('2d');
    const map = decoratedBuildingMap();

    ctx.fillStyle = '#1a1a1a';
    ctx.fillRect(0, 0, 800, 600);
    renderDecorations(ctx as unknown as CanvasRenderingContext2D, map, vp, state);

    // Verify something was drawn
    const data = ctx.getImageData(0, 0, 800, 600).data;
    let nonBgPixels = 0;
    for (let i = 0; i < data.length; i += 4) {
      if (data[i] !== 0x1a || data[i + 1] !== 0x1a || data[i + 2] !== 0x1a) {
        nonBgPixels++;
      }
    }
    expect(nonBgPixels).toBeGreaterThan(10);
  });

  it('skips decorations below detail zoom threshold', () => {
    const canvas = createCanvas(800, 600);
    const ctx = canvas.getContext('2d');
    const map = decoratedBuildingMap();

    ctx.fillStyle = '#1a1a1a';
    ctx.fillRect(0, 0, 800, 600);
    renderDecorations(ctx as unknown as CanvasRenderingContext2D, map, { ...vp, zoom: 0.5 }, state);

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
