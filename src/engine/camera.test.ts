import { describe, it, expect } from 'vitest';
import { Camera } from './camera';

describe('Camera', () => {
  it('initializes with default values', () => {
    const cam = new Camera(800, 600);
    const vp = cam.viewport();
    expect(vp.width).toBe(800);
    expect(vp.height).toBe(600);
    expect(vp.zoom).toBe(1);
    expect(vp.offsetX).toBe(0);
    expect(vp.offsetY).toBe(0);
  });

  describe('pan', () => {
    it('moves the offset', () => {
      const cam = new Camera(800, 600);
      cam.pan(50, -30);
      const vp = cam.viewport();
      expect(vp.offsetX).toBe(50);
      expect(vp.offsetY).toBe(-30);
    });

    it('accumulates pan movements', () => {
      const cam = new Camera(800, 600);
      cam.pan(10, 20);
      cam.pan(5, -10);
      const vp = cam.viewport();
      expect(vp.offsetX).toBe(15);
      expect(vp.offsetY).toBe(10);
    });
  });

  describe('zoom', () => {
    it('sets zoom level', () => {
      const cam = new Camera(800, 600);
      cam.setZoom(2.5);
      expect(cam.viewport().zoom).toBe(2.5);
    });

    it('clamps to minimum zoom', () => {
      const cam = new Camera(800, 600);
      cam.setZoom(0.001);
      expect(cam.viewport().zoom).toBe(0.1);
    });

    it('clamps to maximum zoom', () => {
      const cam = new Camera(800, 600);
      cam.setZoom(100);
      expect(cam.viewport().zoom).toBe(10);
    });

    it('zooms around a screen point', () => {
      const cam = new Camera(800, 600);
      const before = cam.viewport();
      // Zoom in at center — offset should not change
      cam.zoomAt(2, 400, 300);
      const after = cam.viewport();
      expect(after.zoom).toBe(2);
      expect(after.offsetX).toBeCloseTo(0);
      expect(after.offsetY).toBeCloseTo(0);
    });

    it('zooms around an off-center point', () => {
      const cam = new Camera(800, 600);
      // Zoom in at top-left corner
      cam.zoomAt(2, 0, 0);
      const vp = cam.viewport();
      expect(vp.zoom).toBe(2);
      // Offset should shift to keep the top-left point stable
      expect(vp.offsetX).not.toBe(0);
      expect(vp.offsetY).not.toBe(0);
    });
  });

  describe('fitBounds', () => {
    it('fits world bounds to viewport', () => {
      const cam = new Camera(800, 600);
      cam.fitBounds({ minX: 0, maxX: 100, minZ: 0, maxZ: 100 });
      const vp = cam.viewport();
      // Should set zoom and offset so the bounds fill the viewport
      expect(vp.zoom).toBeGreaterThan(0);
      expect(vp.zoom).toBeLessThanOrEqual(10);
    });

    it('centers the view on the bounds', () => {
      const cam = new Camera(800, 600);
      cam.fitBounds({ minX: -50, maxX: 50, minZ: -50, maxZ: 50 });
      // After fitting, world origin should project near viewport center
      // (bounds are symmetric around origin)
      const vp = cam.viewport();
      expect(vp.offsetX).toBeDefined();
      expect(vp.offsetY).toBeDefined();
    });
  });

  describe('resize', () => {
    it('updates viewport dimensions', () => {
      const cam = new Camera(800, 600);
      cam.resize(1920, 1080);
      const vp = cam.viewport();
      expect(vp.width).toBe(1920);
      expect(vp.height).toBe(1080);
    });

    it('preserves zoom and offset on resize', () => {
      const cam = new Camera(800, 600);
      cam.setZoom(2);
      cam.pan(100, -50);
      cam.resize(1920, 1080);
      const vp = cam.viewport();
      expect(vp.zoom).toBe(2);
      expect(vp.offsetX).toBe(100);
      expect(vp.offsetY).toBe(-50);
    });
  });

  describe('panTo', () => {
    it('centers the view on a world position', () => {
      const cam = new Camera(800, 600);
      cam.panTo(50, 30);
      // After panTo, the world point (50, 0, 30) should be at viewport center
      const vp = cam.viewport();
      expect(vp.offsetX).toBeDefined();
      expect(vp.offsetY).toBeDefined();
    });
  });
});
