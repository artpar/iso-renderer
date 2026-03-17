/**
 * Shared isometric drawing utilities used across layers.
 */
import { worldToScreen } from './projection';
import type { Viewport } from '../types';

/** Get the 4 corners of an isometric top face (Y = height) */
export function isoTopFace(
  x: number, z: number, w: number, d: number, h: number, vp: Viewport,
): { x: number; y: number }[] {
  return [
    worldToScreen(x, h, z, vp),         // back-left
    worldToScreen(x + w, h, z, vp),     // back-right
    worldToScreen(x + w, h, z + d, vp), // front-right
    worldToScreen(x, h, z + d, vp),     // front-left
  ];
}

/** Get the 4 corners of the left face (visible left side in iso) */
export function isoLeftFace(
  x: number, z: number, _w: number, d: number, h: number, vp: Viewport,
): { x: number; y: number }[] {
  return [
    worldToScreen(x, h, z, vp),         // top-back
    worldToScreen(x, h, z + d, vp),     // top-front
    worldToScreen(x, 0, z + d, vp),     // bottom-front
    worldToScreen(x, 0, z, vp),         // bottom-back
  ];
}

/** Get the 4 corners of the right face (visible right side in iso) */
export function isoRightFace(
  x: number, z: number, w: number, d: number, h: number, vp: Viewport,
): { x: number; y: number }[] {
  return [
    worldToScreen(x + w, h, z + d, vp), // top-front
    worldToScreen(x + w, h, z, vp),     // top-back
    worldToScreen(x + w, 0, z, vp),     // bottom-back
    worldToScreen(x + w, 0, z + d, vp), // bottom-front
  ];
}

/** Get the 4 corners of a flat ground quad (Y = 0) */
export function isoGroundQuad(
  x: number, z: number, w: number, d: number, vp: Viewport,
): { x: number; y: number }[] {
  return [
    worldToScreen(x, 0, z, vp),
    worldToScreen(x + w, 0, z, vp),
    worldToScreen(x + w, 0, z + d, vp),
    worldToScreen(x, 0, z + d, vp),
  ];
}

/** Draw a filled polygon from screen-space points */
export function fillPoly(
  ctx: CanvasRenderingContext2D,
  points: { x: number; y: number }[],
  color: string,
): void {
  if (points.length < 3) return;
  ctx.beginPath();
  ctx.moveTo(points[0].x, points[0].y);
  for (let i = 1; i < points.length; i++) {
    ctx.lineTo(points[i].x, points[i].y);
  }
  ctx.closePath();
  ctx.fillStyle = color;
  ctx.fill();
}

/** Draw a stroked polygon from screen-space points */
export function strokePoly(
  ctx: CanvasRenderingContext2D,
  points: { x: number; y: number }[],
  color: string,
  lineWidth: number = 1,
): void {
  if (points.length < 3) return;
  ctx.beginPath();
  ctx.moveTo(points[0].x, points[0].y);
  for (let i = 1; i < points.length; i++) {
    ctx.lineTo(points[i].x, points[i].y);
  }
  ctx.closePath();
  ctx.strokeStyle = color;
  ctx.lineWidth = lineWidth;
  ctx.stroke();
}

/** Draw an isometric line between two world points */
export function isoLine(
  ctx: CanvasRenderingContext2D,
  x1: number, y1: number, z1: number,
  x2: number, y2: number, z2: number,
  vp: Viewport,
  color: string,
  lineWidth: number = 1,
): void {
  const s1 = worldToScreen(x1, y1, z1, vp);
  const s2 = worldToScreen(x2, y2, z2, vp);
  ctx.beginPath();
  ctx.moveTo(s1.x, s1.y);
  ctx.lineTo(s2.x, s2.y);
  ctx.strokeStyle = color;
  ctx.lineWidth = lineWidth;
  ctx.stroke();
}
