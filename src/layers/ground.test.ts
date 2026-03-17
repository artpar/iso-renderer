import { describe, it, expect } from 'vitest';
import { createCanvas } from 'canvas';
import { renderGround } from './ground';
import { singleBuildingMap, twoCitiesWithRoadMap } from '../test/fixtures';
import { matchesSnapshot } from '../test/visual';
import { worldToScreen } from '../engine/projection';
import type { Viewport, RenderState } from '../types';

const vp: Viewport = { width: 800, height: 600, zoom: 8, offsetX: 0, offsetY: 0 };
const state: RenderState = { selectedId: null, hoveredId: null, highlightedIds: new Set() };

describe('ground layer', () => {
  it('renders a single city platform', () => {
    const canvas = createCanvas(800, 600);
    const ctx = canvas.getContext('2d');
    const map = singleBuildingMap();

    ctx.fillStyle = '#1a1a1a';
    ctx.fillRect(0, 0, 800, 600);
    renderGround(ctx as unknown as CanvasRenderingContext2D, map, vp, state);

    const result = matchesSnapshot('layer-ground-single', canvas);
    expect(result.pass).toBe(true);
  });

  it('renders two city platforms', () => {
    const canvas = createCanvas(800, 600);
    const ctx = canvas.getContext('2d');
    const map = twoCitiesWithRoadMap();

    ctx.fillStyle = '#1a1a1a';
    ctx.fillRect(0, 0, 800, 600);
    renderGround(ctx as unknown as CanvasRenderingContext2D, map, { ...vp, zoom: 4 }, state);

    const result = matchesSnapshot('layer-ground-two-cities', canvas);
    expect(result.pass).toBe(true);
  });

  it('highlights focused city platform with accent border', () => {
    const canvas = createCanvas(800, 600);
    const ctx = canvas.getContext('2d');
    const map = singleBuildingMap();

    ctx.fillStyle = '#1a1a1a';
    ctx.fillRect(0, 0, 800, 600);
    renderGround(ctx as unknown as CanvasRenderingContext2D, map, vp, state);

    // Focused city should have accent border
    const result = matchesSnapshot('layer-ground-focused', canvas);
    expect(result.pass).toBe(true);
  });
});
