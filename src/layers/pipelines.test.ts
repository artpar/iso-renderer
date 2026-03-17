import { describe, it, expect } from 'vitest';
import { createCanvas } from 'canvas';
import { renderPipelines } from './pipelines';
import { cityWithPipelinesMap } from '../test/fixtures';
import { matchesSnapshot } from '../test/visual';
import type { Viewport, RenderState } from '../types';

const vp: Viewport = { width: 800, height: 600, zoom: 8, offsetX: 0, offsetY: 0 };
const state: RenderState = { selectedId: null, hoveredId: null, highlightedIds: new Set() };

describe('pipelines layer', () => {
  it('renders pipelines with direction arrows', () => {
    const canvas = createCanvas(800, 600);
    const ctx = canvas.getContext('2d');
    const map = cityWithPipelinesMap();

    ctx.fillStyle = '#1a1a1a';
    ctx.fillRect(0, 0, 800, 600);
    renderPipelines(ctx as unknown as CanvasRenderingContext2D, map, vp, state);

    const result = matchesSnapshot('layer-pipelines-directed', canvas);
    expect(result.pass).toBe(true);
  });

  it('draws visible pipe paths', () => {
    const canvas = createCanvas(800, 600);
    const ctx = canvas.getContext('2d');
    const map = cityWithPipelinesMap();

    ctx.fillStyle = '#1a1a1a';
    ctx.fillRect(0, 0, 800, 600);
    renderPipelines(ctx as unknown as CanvasRenderingContext2D, map, vp, state);

    const data = ctx.getImageData(0, 0, 800, 600).data;
    let nonBgPixels = 0;
    for (let i = 0; i < data.length; i += 4) {
      if (data[i] !== 0x1a || data[i + 1] !== 0x1a || data[i + 2] !== 0x1a) {
        nonBgPixels++;
      }
    }
    expect(nonBgPixels).toBeGreaterThan(50);
  });
});
