import { ZOOM, ISO } from '../constants';
import { worldToScreen } from './projection';
import type { Viewport, MapBounds } from '../types';

export class Camera {
  private _width: number;
  private _height: number;
  private _zoom: number = ZOOM.default;
  private _offsetX: number = 0;
  private _offsetY: number = 0;

  constructor(width: number, height: number) {
    this._width = width;
    this._height = height;
  }

  viewport(): Viewport {
    return {
      width: this._width,
      height: this._height,
      zoom: this._zoom,
      offsetX: this._offsetX,
      offsetY: this._offsetY,
    };
  }

  pan(dx: number, dy: number): void {
    this._offsetX += dx;
    this._offsetY += dy;
  }

  /** Center the view on a world XZ position */
  panTo(worldX: number, worldZ: number): void {
    // We want worldToScreen(worldX, 0, worldZ) to map to viewport center
    // screenX = w/2 + (wX - wZ)*cos30*zoom + offsetX = w/2
    // → offsetX = -(wX - wZ)*cos30*zoom
    // screenY = h/2 + (wX + wZ)*sin30*zoom + offsetY = h/2
    // → offsetY = -(wX + wZ)*sin30*zoom
    this._offsetX = -(worldX - worldZ) * ISO.cos30 * this._zoom;
    this._offsetY = -(worldX + worldZ) * ISO.sin30 * this._zoom;
  }

  setZoom(level: number): void {
    this._zoom = Math.max(ZOOM.min, Math.min(ZOOM.max, level));
  }

  /** Zoom towards a screen point (keeps that point stable) */
  zoomAt(newZoom: number, screenX: number, screenY: number): void {
    const clamped = Math.max(ZOOM.min, Math.min(ZOOM.max, newZoom));
    const ratio = clamped / this._zoom;

    // Adjust offset so that the screen point stays in the same world position
    const cx = this._width / 2;
    const cy = this._height / 2;
    this._offsetX = (this._offsetX - (screenX - cx)) * ratio + (screenX - cx);
    this._offsetY = (this._offsetY - (screenY - cy)) * ratio + (screenY - cy);
    this._zoom = clamped;
  }

  /** Fit the view to show the given world bounds */
  fitBounds(bounds: MapBounds): void {
    const centerX = (bounds.minX + bounds.maxX) / 2;
    const centerZ = (bounds.minZ + bounds.maxZ) / 2;
    const spanX = bounds.maxX - bounds.minX;
    const spanZ = bounds.maxZ - bounds.minZ;

    // The isometric extent in screen space:
    // horizontal extent ≈ (spanX + spanZ) * cos30
    // vertical extent ≈ (spanX + spanZ) * sin30
    const screenW = (spanX + spanZ) * ISO.cos30;
    const screenH = (spanX + spanZ) * ISO.sin30;

    const zoomX = (this._width * 0.9) / screenW;
    const zoomY = (this._height * 0.9) / screenH;
    this._zoom = Math.max(ZOOM.min, Math.min(ZOOM.max, Math.min(zoomX, zoomY)));

    this.panTo(centerX, centerZ);
  }

  resize(width: number, height: number): void {
    this._width = width;
    this._height = height;
  }
}
