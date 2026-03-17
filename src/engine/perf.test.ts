import { describe, it, expect } from 'vitest';
import { createCanvas } from 'canvas';
import { IsoEngine } from './iso-engine';
import { stressTestMap } from '../test/fixtures';

describe('performance', () => {
  it('renders 500 buildings under 20ms', () => {
    const canvas = createCanvas(800, 600);
    const engine = new IsoEngine({ canvas: canvas as unknown as HTMLCanvasElement });
    const map = stressTestMap(500);
    engine.setMap(map);
    engine.fitBounds(map.bounds);

    // Warmup
    engine.render();

    // Measure
    const start = performance.now();
    engine.render();
    const elapsed = performance.now() - start;

    expect(elapsed).toBeLessThan(20);
  });

  it('renders 1000 buildings under 50ms', () => {
    const canvas = createCanvas(1920, 1080);
    const engine = new IsoEngine({ canvas: canvas as unknown as HTMLCanvasElement });
    const map = stressTestMap(1000);
    engine.setMap(map);
    engine.fitBounds(map.bounds);

    engine.render();
    const start = performance.now();
    engine.render();
    const elapsed = performance.now() - start;

    expect(elapsed).toBeLessThan(50);
  });

  it('hit-test responds under 1ms for 500 buildings', () => {
    const canvas = createCanvas(800, 600);
    const engine = new IsoEngine({ canvas: canvas as unknown as HTMLCanvasElement });
    const map = stressTestMap(500);
    engine.setMap(map);
    engine.fitBounds(map.bounds);
    engine.render();

    const start = performance.now();
    for (let i = 0; i < 100; i++) {
      engine.buildingAt(Math.random() * 800, Math.random() * 600);
    }
    const elapsed = (performance.now() - start) / 100;

    expect(elapsed).toBeLessThan(1);
  });
});
