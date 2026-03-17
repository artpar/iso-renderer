import { describe, it, expect } from 'vitest';
import { createCanvas } from 'canvas';
import { renderStreets } from './streets';
import { singleBuildingMap, threeBuildingsMap } from '../test/fixtures';
import { matchesSnapshot } from '../test/visual';
import type { Viewport, RenderState } from '../types';

const vp: Viewport = { width: 800, height: 600, zoom: 8, offsetX: 0, offsetY: 0 };
const state: RenderState = { selectedId: null, hoveredId: null, highlightedIds: new Set() };

describe('streets layer', () => {
  it('renders grid lines inside a city', () => {
    const canvas = createCanvas(800, 600);
    const ctx = canvas.getContext('2d');
    const map = threeBuildingsMap();

    ctx.fillStyle = '#1a1a1a';
    ctx.fillRect(0, 0, 800, 600);
    renderStreets(ctx as unknown as CanvasRenderingContext2D, map, vp, state);

    const result = matchesSnapshot('layer-streets-grid', canvas);
    expect(result.pass).toBe(true);
  });

  it('renders city perimeter', () => {
    const canvas = createCanvas(800, 600);
    const ctx = canvas.getContext('2d');
    const map = singleBuildingMap();

    ctx.fillStyle = '#1a1a1a';
    ctx.fillRect(0, 0, 800, 600);
    renderStreets(ctx as unknown as CanvasRenderingContext2D, map, vp, state);

    const result = matchesSnapshot('layer-streets-perimeter', canvas);
    expect(result.pass).toBe(true);
  });
});
