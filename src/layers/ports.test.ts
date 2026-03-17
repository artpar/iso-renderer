import { describe, it, expect } from 'vitest';
import { createCanvas } from 'canvas';
import { renderPorts } from './ports';
import { twoCitiesWithRoadMap, cityWithPipelinesMap } from '../test/fixtures';
import { matchesSnapshot } from '../test/visual';
import type { Viewport, RenderState } from '../types';

const vp: Viewport = { width: 800, height: 600, zoom: 6, offsetX: 0, offsetY: 0 };
const state: RenderState = { selectedId: null, hoveredId: null, highlightedIds: new Set() };

describe('ports layer', () => {
  it('renders input and output ports on cities', () => {
    const canvas = createCanvas(800, 600);
    const ctx = canvas.getContext('2d');
    const map = twoCitiesWithRoadMap();

    ctx.fillStyle = '#1a1a1a';
    ctx.fillRect(0, 0, 800, 600);
    renderPorts(ctx as unknown as CanvasRenderingContext2D, map, vp, state);

    const result = matchesSnapshot('layer-ports-io', canvas);
    expect(result.pass).toBe(true);
  });

  it('renders multiple ports per city', () => {
    const canvas = createCanvas(800, 600);
    const ctx = canvas.getContext('2d');
    const map = cityWithPipelinesMap();

    ctx.fillStyle = '#1a1a1a';
    ctx.fillRect(0, 0, 800, 600);
    renderPorts(ctx as unknown as CanvasRenderingContext2D, map, vp, state);

    const result = matchesSnapshot('layer-ports-multiple', canvas);
    expect(result.pass).toBe(true);
  });
});
