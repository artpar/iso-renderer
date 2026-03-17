import { describe, it, expect } from 'vitest';
import { createCanvas } from 'canvas';
import { renderParticles, type ParticleState } from './particles';
import { cityWithPipelinesMap } from '../test/fixtures';
import { matchesSnapshot } from '../test/visual';
import type { Viewport, RenderState } from '../types';

const vp: Viewport = { width: 800, height: 600, zoom: 8, offsetX: 0, offsetY: 0 };
const state: RenderState = { selectedId: null, hoveredId: null, highlightedIds: new Set() };

describe('particles layer', () => {
  it('renders particles along pipeline paths at t=0', () => {
    const canvas = createCanvas(800, 600);
    const ctx = canvas.getContext('2d');
    const map = cityWithPipelinesMap();

    ctx.fillStyle = '#1a1a1a';
    ctx.fillRect(0, 0, 800, 600);

    const particleState: ParticleState = { time: 0 };
    renderParticles(ctx as unknown as CanvasRenderingContext2D, map, vp, state, particleState);

    const result = matchesSnapshot('layer-particles-t0', canvas);
    expect(result.pass).toBe(true);
  });

  it('renders particles at different position at t=500ms', () => {
    const canvas = createCanvas(800, 600);
    const ctx = canvas.getContext('2d');
    const map = cityWithPipelinesMap();

    ctx.fillStyle = '#1a1a1a';
    ctx.fillRect(0, 0, 800, 600);

    const particleState: ParticleState = { time: 500 };
    renderParticles(ctx as unknown as CanvasRenderingContext2D, map, vp, state, particleState);

    const result = matchesSnapshot('layer-particles-t500', canvas);
    expect(result.pass).toBe(true);
  });

  it('draws visible particles', () => {
    const canvas = createCanvas(800, 600);
    const ctx = canvas.getContext('2d');
    const map = cityWithPipelinesMap();

    ctx.fillStyle = '#1a1a1a';
    ctx.fillRect(0, 0, 800, 600);

    const particleState: ParticleState = { time: 0 };
    renderParticles(ctx as unknown as CanvasRenderingContext2D, map, vp, state, particleState);

    const data = ctx.getImageData(0, 0, 800, 600).data;
    let nonBgPixels = 0;
    for (let i = 0; i < data.length; i += 4) {
      if (data[i] !== 0x1a || data[i + 1] !== 0x1a || data[i + 2] !== 0x1a) {
        nonBgPixels++;
      }
    }
    expect(nonBgPixels).toBeGreaterThan(5);
  });
});
