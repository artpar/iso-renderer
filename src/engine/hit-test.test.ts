import { describe, it, expect } from 'vitest';
import { HitTester } from './hit-test';

describe('HitTester', () => {
  it('returns null for empty index', () => {
    const ht = new HitTester(800, 600);
    expect(ht.hitTest(400, 300)).toBeNull();
  });

  it('finds a building by screen coordinates inside its polygon', () => {
    const ht = new HitTester(800, 600);
    // Insert a diamond-shaped polygon (isometric top face)
    ht.insert('b-1', [
      { x: 400, y: 280 },  // top
      { x: 430, y: 295 },  // right
      { x: 400, y: 310 },  // bottom
      { x: 370, y: 295 },  // left
    ], 0);
    expect(ht.hitTest(400, 295)).toBe('b-1');
  });

  it('returns null for coordinates outside all polygons', () => {
    const ht = new HitTester(800, 600);
    ht.insert('b-1', [
      { x: 100, y: 100 },
      { x: 130, y: 115 },
      { x: 100, y: 130 },
      { x: 70, y: 115 },
    ], 0);
    expect(ht.hitTest(500, 400)).toBeNull();
  });

  it('picks topmost (highest draw order) when overlapping', () => {
    const ht = new HitTester(800, 600);
    // Background building (drawn first, lower draw order)
    ht.insert('b-back', [
      { x: 380, y: 270 },
      { x: 420, y: 290 },
      { x: 380, y: 310 },
      { x: 340, y: 290 },
    ], 0);
    // Foreground building (drawn later, higher draw order)
    ht.insert('b-front', [
      { x: 390, y: 280 },
      { x: 410, y: 290 },
      { x: 390, y: 300 },
      { x: 370, y: 290 },
    ], 1);
    // Point inside both — should pick front
    expect(ht.hitTest(390, 290)).toBe('b-front');
  });

  it('clears all entries', () => {
    const ht = new HitTester(800, 600);
    ht.insert('b-1', [
      { x: 400, y: 280 },
      { x: 430, y: 295 },
      { x: 400, y: 310 },
      { x: 370, y: 295 },
    ], 0);
    expect(ht.hitTest(400, 295)).toBe('b-1');
    ht.clear();
    expect(ht.hitTest(400, 295)).toBeNull();
  });

  it('handles resize', () => {
    const ht = new HitTester(800, 600);
    ht.insert('b-1', [
      { x: 400, y: 280 },
      { x: 430, y: 295 },
      { x: 400, y: 310 },
      { x: 370, y: 295 },
    ], 0);
    ht.resize(1920, 1080);
    // After resize, old entries are cleared (screen coords changed)
    expect(ht.hitTest(400, 295)).toBeNull();
  });

  it('handles many buildings efficiently', () => {
    const ht = new HitTester(800, 600);
    const count = 500;
    for (let i = 0; i < count; i++) {
      const cx = (i % 25) * 30 + 15;
      const cy = Math.floor(i / 25) * 30 + 15;
      ht.insert(`b-${i}`, [
        { x: cx, y: cy - 10 },
        { x: cx + 10, y: cy },
        { x: cx, y: cy + 10 },
        { x: cx - 10, y: cy },
      ], i);
    }
    // Should find a specific building
    const result = ht.hitTest(15, 15);
    expect(result).toBe('b-0');
  });
});
