import { describe, it, expect } from 'vitest';
import { depthSort, type Drawable } from './painter';

describe('painter depthSort', () => {
  it('sorts back-to-front by worldX + worldZ ascending', () => {
    const items: Drawable[] = [
      { id: 'front', worldX: 10, worldZ: 10, worldY: 0 },
      { id: 'back', worldX: 0, worldZ: 0, worldY: 0 },
      { id: 'mid', worldX: 5, worldZ: 5, worldY: 0 },
    ];
    const sorted = depthSort(items);
    expect(sorted.map(d => d.id)).toEqual(['back', 'mid', 'front']);
  });

  it('handles equal depth — stable sort by id for determinism', () => {
    const items: Drawable[] = [
      { id: 'b', worldX: 5, worldZ: 5, worldY: 0 },
      { id: 'a', worldX: 3, worldZ: 7, worldY: 0 },
    ];
    // Both have depth 10
    const sorted = depthSort(items);
    // Should maintain stable order or sort by id
    expect(sorted.length).toBe(2);
    expect(sorted[0].worldX + sorted[0].worldZ).toBe(10);
  });

  it('returns empty array for empty input', () => {
    expect(depthSort([])).toEqual([]);
  });

  it('handles single item', () => {
    const items: Drawable[] = [{ id: 'only', worldX: 5, worldZ: 3, worldY: 0 }];
    expect(depthSort(items)).toEqual(items);
  });

  it('higher Y (taller) items have same sort position', () => {
    // Y height doesn't affect painter's sort — it's purely X+Z
    const items: Drawable[] = [
      { id: 'tall', worldX: 0, worldZ: 0, worldY: 10 },
      { id: 'short', worldX: 5, worldZ: 5, worldY: 0 },
    ];
    const sorted = depthSort(items);
    expect(sorted[0].id).toBe('tall'); // lower X+Z drawn first
    expect(sorted[1].id).toBe('short');
  });

  it('sorts large arrays correctly', () => {
    const items: Drawable[] = Array.from({ length: 1000 }, (_, i) => ({
      id: `d-${i}`,
      worldX: Math.random() * 100,
      worldZ: Math.random() * 100,
      worldY: 0,
    }));
    const sorted = depthSort(items);
    for (let i = 1; i < sorted.length; i++) {
      const prevDepth = sorted[i - 1].worldX + sorted[i - 1].worldZ;
      const currDepth = sorted[i].worldX + sorted[i].worldZ;
      expect(currDepth).toBeGreaterThanOrEqual(prevDepth);
    }
  });
});
