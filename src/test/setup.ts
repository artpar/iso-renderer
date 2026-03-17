/**
 * Vitest setup — provides a real Canvas 2D implementation via node-canvas
 * so rendering tests produce actual pixels for visual regression comparison.
 */
import { createCanvas, Canvas, CanvasRenderingContext2D } from 'canvas';

// Polyfill HTMLCanvasElement.getContext for node environment
// IsoEngine expects a standard HTMLCanvasElement — node-canvas is API-compatible
declare global {
  function createTestCanvas(width?: number, height?: number): Canvas;
}

globalThis.createTestCanvas = (width = 800, height = 600): Canvas => {
  return createCanvas(width, height);
};
