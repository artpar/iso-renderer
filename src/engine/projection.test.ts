import { describe, it, expect } from 'vitest';
import { worldToScreen, screenToWorld } from './projection';
import { ISO } from '../constants';

describe('projection', () => {
  const vp = { width: 800, height: 600, zoom: 1, offsetX: 0, offsetY: 0 };

  describe('worldToScreen', () => {
    it('projects origin to viewport center', () => {
      const s = worldToScreen(0, 0, 0, vp);
      expect(s.x).toBeCloseTo(400);
      expect(s.y).toBeCloseTo(300);
    });

    it('projects positive X to the right and down', () => {
      const s = worldToScreen(10, 0, 0, vp);
      expect(s.x).toBeGreaterThan(400);
      expect(s.y).toBeGreaterThan(300);
    });

    it('projects positive Z to the left and down', () => {
      const s = worldToScreen(0, 0, 10, vp);
      expect(s.x).toBeLessThan(400);
      expect(s.y).toBeGreaterThan(300);
    });

    it('projects positive Y upward (screen Y decreases)', () => {
      const s = worldToScreen(0, 10, 0, vp);
      expect(s.x).toBeCloseTo(400);
      expect(s.y).toBeLessThan(300);
    });

    it('uses standard isometric formula', () => {
      const s = worldToScreen(5, 3, 7, vp);
      // screenX = vpW/2 + (worldX - worldZ) * cos30 * zoom + offsetX
      // screenY = vpH/2 + (worldX + worldZ) * sin30 * zoom - worldY * zoom + offsetY
      const expectedX = 400 + (5 - 7) * ISO.cos30 * 1;
      const expectedY = 300 + (5 + 7) * ISO.sin30 * 1 - 3 * 1;
      expect(s.x).toBeCloseTo(expectedX);
      expect(s.y).toBeCloseTo(expectedY);
    });

    it('applies zoom', () => {
      const zoomedVp = { ...vp, zoom: 2 };
      const normal = worldToScreen(10, 0, 0, vp);
      const zoomed = worldToScreen(10, 0, 0, zoomedVp);
      // Distance from center should double
      const normalDist = Math.hypot(normal.x - 400, normal.y - 300);
      const zoomedDist = Math.hypot(zoomed.x - 400, zoomed.y - 300);
      expect(zoomedDist).toBeCloseTo(normalDist * 2);
    });

    it('applies offset', () => {
      const offsetVp = { ...vp, offsetX: 50, offsetY: -30 };
      const s = worldToScreen(0, 0, 0, offsetVp);
      expect(s.x).toBeCloseTo(450);
      expect(s.y).toBeCloseTo(270);
    });

    it('is consistent with cos30 and sin30', () => {
      // At equal X and Z, the horizontal displacement cancels out
      const s = worldToScreen(10, 0, 10, vp);
      expect(s.x).toBeCloseTo(400); // (10-10)*cos30 = 0
      expect(s.y).toBeGreaterThan(300); // (10+10)*sin30 = 10
    });
  });

  describe('screenToWorld', () => {
    it('inverse of worldToScreen at Y=0', () => {
      const worldPt = { x: 15, z: 8 };
      const screen = worldToScreen(worldPt.x, 0, worldPt.z, vp);
      const back = screenToWorld(screen.x, screen.y, vp);
      expect(back.x).toBeCloseTo(worldPt.x);
      expect(back.z).toBeCloseTo(worldPt.z);
    });

    it('handles origin correctly', () => {
      const back = screenToWorld(400, 300, vp);
      expect(back.x).toBeCloseTo(0);
      expect(back.z).toBeCloseTo(0);
    });

    it('handles zoomed viewport', () => {
      const zoomedVp = { ...vp, zoom: 3 };
      const worldPt = { x: 5, z: 12 };
      const screen = worldToScreen(worldPt.x, 0, worldPt.z, zoomedVp);
      const back = screenToWorld(screen.x, screen.y, zoomedVp);
      expect(back.x).toBeCloseTo(worldPt.x);
      expect(back.z).toBeCloseTo(worldPt.z);
    });

    it('handles offset viewport', () => {
      const offsetVp = { ...vp, offsetX: -100, offsetY: 50 };
      const worldPt = { x: 20, z: 3 };
      const screen = worldToScreen(worldPt.x, 0, worldPt.z, offsetVp);
      const back = screenToWorld(screen.x, screen.y, offsetVp);
      expect(back.x).toBeCloseTo(worldPt.x);
      expect(back.z).toBeCloseTo(worldPt.z);
    });
  });
});
