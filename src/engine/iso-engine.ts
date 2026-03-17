import { Camera } from './camera';
import { HitTester } from './hit-test';
import { InputHandler } from './input';
import { depthSort } from './painter';
import { worldToScreen as projWorldToScreen } from './projection';
import { buildingTopPoly } from '../layers/buildings';
import { renderGround } from '../layers/ground';
import { renderStreets } from '../layers/streets';
import { renderRoads } from '../layers/roads';
import { renderPipelines } from '../layers/pipelines';
import { renderPorts } from '../layers/ports';
import { renderBuildings } from '../layers/buildings';
import { renderDecorations } from '../layers/decorations';
import { renderLabels } from '../layers/labels';
import { renderOverlays } from '../layers/overlays';
import { renderParticles, type ParticleState } from '../layers/particles';
import { CITY } from '../constants';
import type { IsoMap, MapBounds, RenderState, IsoCallbacks } from '../types';

export interface IsoEngineConfig {
  canvas: HTMLCanvasElement;
}

export class IsoEngine {
  private _canvas: HTMLCanvasElement;
  private _ctx: CanvasRenderingContext2D;
  private _camera: Camera;
  private _hitTester: HitTester;
  private _input: InputHandler | null = null;
  private _map: IsoMap | null = null;
  private _callbacks: IsoCallbacks = {};
  private _animFrame: number | null = null;
  private _particleState: ParticleState = { time: 0 };
  private _animStartTime: number = 0;

  // Interaction state
  private _selectedId: string | null = null;
  private _hoveredId: string | null = null;
  private _highlightedIds: Set<string> = new Set();

  constructor(config: IsoEngineConfig) {
    this._canvas = config.canvas;
    this._ctx = config.canvas.getContext('2d')!;
    this._camera = new Camera(config.canvas.width, config.canvas.height);
    this._hitTester = new HitTester(config.canvas.width, config.canvas.height);

    // Only bind input if we're in a browser (canvas has addEventListener)
    if (typeof config.canvas.addEventListener === 'function') {
      try {
        this._input = new InputHandler(config.canvas);
        this._wireInput();
      } catch {
        // Node environment — skip input binding
      }
    }
  }

  private _wireInput(): void {
    if (!this._input) return;

    this._input.onPan = (dx, dy) => {
      this._camera.pan(dx, dy);
      this._renderStatic();
    };

    this._input.onZoom = (delta, screenX, screenY) => {
      const vp = this._camera.viewport();
      const factor = delta > 0 ? 1.15 : 1 / 1.15;
      this._camera.zoomAt(vp.zoom * factor, screenX, screenY);
      this._renderStatic();
    };

    this._input.onHover = (sx, sy) => {
      this.handleHover(sx, sy);
    };

    this._input.onClick = (sx, sy) => {
      this.handleClick(sx, sy);
    };

    this._input.onDoubleClick = (sx, sy) => {
      const id = this._hitTester.hitTest(sx, sy);
      if (id && this._callbacks.onFocus) {
        this._callbacks.onFocus(id);
      }
    };
  }

  setMap(map: IsoMap): void {
    this._map = map;
  }

  setSelectedId(id: string | null): void {
    this._selectedId = id;
  }

  setHoveredId(id: string | null): void {
    this._hoveredId = id;
  }

  setHighlightedIds(ids: Set<string>): void {
    this._highlightedIds = ids;
  }

  setCallbacks(cb: IsoCallbacks): void {
    this._callbacks = cb;
  }

  panTo(worldX: number, worldZ: number): void {
    this._camera.panTo(worldX, worldZ);
  }

  zoomTo(level: number): void {
    this._camera.setZoom(level);
  }

  fitBounds(bounds: MapBounds): void {
    this._camera.fitBounds(bounds);
  }

  /** Single frame render — draws all static layers */
  render(): void {
    this._renderStatic();
  }

  private _renderStatic(): void {
    if (!this._map) return;

    const ctx = this._ctx;
    const vp = this._camera.viewport();
    const state = this._renderState();

    // Clear
    ctx.fillStyle = CITY.bg;
    ctx.fillRect(0, 0, vp.width, vp.height);

    // Layer render order
    renderGround(ctx, this._map, vp, state);
    renderStreets(ctx, this._map, vp, state);
    renderRoads(ctx, this._map, vp, state);
    renderPipelines(ctx, this._map, vp, state);
    renderPorts(ctx, this._map, vp, state);
    renderBuildings(ctx, this._map, vp, state);
    renderDecorations(ctx, this._map, vp, state);
    renderLabels(ctx, this._map, vp, state);
    renderOverlays(ctx, this._map, vp, state);

    // Rebuild hit-test index after render
    this._rebuildHitTest();
  }

  private _rebuildHitTest(): void {
    if (!this._map) return;

    this._hitTester.clear();
    const vp = this._camera.viewport();
    const sorted = depthSort(
      this._map.buildings.map(b => ({
        ...b,
        worldY: 0,
      })),
    );

    for (let i = 0; i < sorted.length; i++) {
      const poly = buildingTopPoly(sorted[i], vp);
      this._hitTester.insert(sorted[i].id, poly, i);
    }
  }

  private _renderState(): RenderState {
    return {
      selectedId: this._selectedId,
      hoveredId: this._hoveredId,
      highlightedIds: this._highlightedIds,
    };
  }

  /** Start animation loop (for particles) */
  startAnimationLoop(): void {
    this._animStartTime = performance.now();
    const loop = () => {
      this._particleState.time = performance.now() - this._animStartTime;
      this._renderStatic();
      if (this._map) {
        renderParticles(this._ctx, this._map, this._camera.viewport(), this._renderState(), this._particleState);
      }
      this._animFrame = requestAnimationFrame(loop);
    };
    this._animFrame = requestAnimationFrame(loop);
  }

  stopAnimationLoop(): void {
    if (this._animFrame !== null) {
      cancelAnimationFrame(this._animFrame);
      this._animFrame = null;
    }
  }

  /** Handle hover at screen coordinates — used internally and for testing */
  handleHover(screenX: number, screenY: number): void {
    const id = this._hitTester.hitTest(screenX, screenY);
    if (id !== this._hoveredId) {
      this._hoveredId = id;
      if (this._callbacks.onHover) {
        this._callbacks.onHover(id);
      }
      this._renderStatic();
    }
  }

  /** Handle click at screen coordinates */
  handleClick(screenX: number, screenY: number): void {
    const id = this._hitTester.hitTest(screenX, screenY);
    this._selectedId = id;
    if (this._callbacks.onSelect) {
      this._callbacks.onSelect(id);
    }
    this._renderStatic();
  }

  /** Query: find building at screen point */
  buildingAt(screenX: number, screenY: number): string | null {
    return this._hitTester.hitTest(screenX, screenY);
  }

  /** Query: project world point to screen */
  worldToScreen(x: number, y: number, z: number): { x: number; y: number } {
    return projWorldToScreen(x, y, z, this._camera.viewport());
  }

  resize(w: number, h: number): void {
    this._canvas.width = w;
    this._canvas.height = h;
    this._camera.resize(w, h);
    this._hitTester.resize(w, h);
  }

  dispose(): void {
    this.stopAnimationLoop();
    if (this._input) {
      this._input.dispose();
      this._input = null;
    }
  }
}
