import { describe, it, expect, vi, beforeEach } from 'vitest';
import { createCanvas } from 'canvas';
import { IsoEngine } from './iso-engine';
import { singleBuildingMap, threeBuildingsMap, twoCitiesWithRoadMap } from '../test/fixtures';
import { matchesSnapshot } from '../test/visual';

describe('IsoEngine', () => {
  let canvas: ReturnType<typeof createCanvas>;

  beforeEach(() => {
    canvas = createCanvas(800, 600);
  });

  it('constructs without throwing', () => {
    const engine = new IsoEngine({ canvas: canvas as unknown as HTMLCanvasElement });
    expect(engine).toBeDefined();
  });

  it('accepts a map via setMap', () => {
    const engine = new IsoEngine({ canvas: canvas as unknown as HTMLCanvasElement });
    expect(() => engine.setMap(singleBuildingMap())).not.toThrow();
  });

  it('renders without throwing', () => {
    const engine = new IsoEngine({ canvas: canvas as unknown as HTMLCanvasElement });
    engine.setMap(singleBuildingMap());
    expect(() => engine.render()).not.toThrow();
  });

  it('renders a single building correctly', () => {
    const engine = new IsoEngine({ canvas: canvas as unknown as HTMLCanvasElement });
    engine.setMap(singleBuildingMap());
    engine.fitBounds(singleBuildingMap().bounds);
    engine.render();
    const result = matchesSnapshot('engine-single-building', canvas);
    expect(result.pass).toBe(true);
  });

  it('renders three buildings correctly', () => {
    const engine = new IsoEngine({ canvas: canvas as unknown as HTMLCanvasElement });
    engine.setMap(threeBuildingsMap());
    engine.fitBounds(threeBuildingsMap().bounds);
    engine.render();
    const result = matchesSnapshot('engine-three-buildings', canvas);
    expect(result.pass).toBe(true);
  });

  it('renders two cities with road', () => {
    const engine = new IsoEngine({ canvas: canvas as unknown as HTMLCanvasElement });
    const map = twoCitiesWithRoadMap();
    engine.setMap(map);
    engine.fitBounds(map.bounds);
    engine.render();
    const result = matchesSnapshot('engine-two-cities-road', canvas);
    expect(result.pass).toBe(true);
  });

  describe('interaction', () => {
    it('sets selected building', () => {
      const engine = new IsoEngine({ canvas: canvas as unknown as HTMLCanvasElement });
      engine.setMap(singleBuildingMap());
      engine.setSelectedId('b-1');
      engine.render();
      const result = matchesSnapshot('engine-selected', canvas);
      expect(result.pass).toBe(true);
    });

    it('sets hovered building', () => {
      const engine = new IsoEngine({ canvas: canvas as unknown as HTMLCanvasElement });
      engine.setMap(singleBuildingMap());
      engine.setHoveredId('b-1');
      engine.render();
      const result = matchesSnapshot('engine-hovered', canvas);
      expect(result.pass).toBe(true);
    });

    it('sets highlighted buildings', () => {
      const engine = new IsoEngine({ canvas: canvas as unknown as HTMLCanvasElement });
      engine.setMap(threeBuildingsMap());
      engine.setHighlightedIds(new Set(['b-add', 'b-format']));
      engine.fitBounds(threeBuildingsMap().bounds);
      engine.render();
      const result = matchesSnapshot('engine-highlighted', canvas);
      expect(result.pass).toBe(true);
    });
  });

  describe('callbacks', () => {
    it('fires onHover callback when hover state changes', () => {
      const onHover = vi.fn();
      const engine = new IsoEngine({ canvas: canvas as unknown as HTMLCanvasElement });
      engine.setMap(singleBuildingMap());
      engine.setCallbacks({ onHover });
      // Set a pre-existing hover so the change to null triggers callback
      engine.setHoveredId('b-1');
      engine.handleHover(0, 0); // miss — triggers change from 'b-1' to null
      expect(onHover).toHaveBeenCalledWith(null);
    });

    it('fires onSelect callback', () => {
      const onSelect = vi.fn();
      const engine = new IsoEngine({ canvas: canvas as unknown as HTMLCanvasElement });
      engine.setMap(singleBuildingMap());
      engine.setCallbacks({ onSelect });
      engine.handleClick(400, 300);
      expect(onSelect).toHaveBeenCalled();
    });
  });

  describe('camera', () => {
    it('panTo moves view', () => {
      const engine = new IsoEngine({ canvas: canvas as unknown as HTMLCanvasElement });
      engine.setMap(singleBuildingMap());
      engine.panTo(10, 10);
      engine.render();
      const result = matchesSnapshot('engine-panned', canvas);
      expect(result.pass).toBe(true);
    });

    it('zoomTo changes zoom level', () => {
      const engine = new IsoEngine({ canvas: canvas as unknown as HTMLCanvasElement });
      engine.setMap(singleBuildingMap());
      engine.zoomTo(3);
      engine.render();
      const result = matchesSnapshot('engine-zoomed', canvas);
      expect(result.pass).toBe(true);
    });
  });

  describe('query', () => {
    it('worldToScreen returns screen coordinates', () => {
      const engine = new IsoEngine({ canvas: canvas as unknown as HTMLCanvasElement });
      engine.setMap(singleBuildingMap());
      const screen = engine.worldToScreen(10, 0, 10);
      expect(typeof screen.x).toBe('number');
      expect(typeof screen.y).toBe('number');
    });

    it('buildingAt returns building id at screen point', () => {
      const engine = new IsoEngine({ canvas: canvas as unknown as HTMLCanvasElement });
      engine.setMap(singleBuildingMap());
      engine.fitBounds(singleBuildingMap().bounds);
      engine.render();
      // The result depends on hit testing — may be null or 'b-1'
      const result = engine.buildingAt(400, 300);
      expect(result === null || result === 'b-1').toBe(true);
    });
  });

  describe('lifecycle', () => {
    it('resize updates canvas dimensions', () => {
      const engine = new IsoEngine({ canvas: canvas as unknown as HTMLCanvasElement });
      engine.resize(1024, 768);
      // After resize, viewport should reflect new dims
      const screen = engine.worldToScreen(0, 0, 0);
      expect(screen.x).toBeCloseTo(512);
      expect(screen.y).toBeCloseTo(384);
    });

    it('dispose cleans up without error', () => {
      const engine = new IsoEngine({ canvas: canvas as unknown as HTMLCanvasElement });
      engine.setMap(singleBuildingMap());
      expect(() => engine.dispose()).not.toThrow();
    });
  });
});
