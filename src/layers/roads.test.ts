import { describe, it, expect } from 'vitest';
import { createCanvas } from 'canvas';
import { renderRoads } from './roads';
import { twoCitiesWithRoadMap, fullSceneMap } from '../test/fixtures';
import { matchesSnapshot } from '../test/visual';
import type { Viewport, RenderState } from '../types';

const vp: Viewport = { width: 800, height: 600, zoom: 5, offsetX: 0, offsetY: 0 };
const state: RenderState = { selectedId: null, hoveredId: null, highlightedIds: new Set() };

describe('roads layer', () => {
  it('renders a road between two cities', () => {
    const canvas = createCanvas(800, 600);
    const ctx = canvas.getContext('2d');
    const map = twoCitiesWithRoadMap();

    ctx.fillStyle = '#1a1a1a';
    ctx.fillRect(0, 0, 800, 600);
    renderRoads(ctx as unknown as CanvasRenderingContext2D, map, vp, state);

    const result = matchesSnapshot('layer-roads-single', canvas);
    expect(result.pass).toBe(true);
  });

  it('renders multiple roads with different colors', () => {
    const canvas = createCanvas(800, 600);
    const ctx = canvas.getContext('2d');
    const map = fullSceneMap();

    ctx.fillStyle = '#1a1a1a';
    ctx.fillRect(0, 0, 800, 600);
    renderRoads(ctx as unknown as CanvasRenderingContext2D, map, { ...vp, zoom: 3 }, state);

    const result = matchesSnapshot('layer-roads-multiple', canvas);
    expect(result.pass).toBe(true);
  });
});
