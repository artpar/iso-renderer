/**
 * Mouse/wheel event handling for canvas interaction.
 * Translates raw DOM events to pan/zoom/hover/click/doubleClick callbacks.
 * All screen coordinates are canvas-relative (accounting for canvas position on page).
 */

const DRAG_THRESHOLD = 3; // pixels — movement below this is a click, not a drag

export class InputHandler {
  private _canvas: HTMLCanvasElement;
  private _isDown = false;
  private _isDragging = false;
  private _startX = 0;
  private _startY = 0;
  private _lastX = 0;
  private _lastY = 0;
  private _listeners: Array<[string, EventListener, AddEventListenerOptions?]> = [];

  onPan: ((dx: number, dy: number) => void) | null = null;
  onZoom: ((delta: number, screenX: number, screenY: number) => void) | null = null;
  onHover: ((screenX: number, screenY: number) => void) | null = null;
  onClick: ((screenX: number, screenY: number) => void) | null = null;
  onDoubleClick: ((screenX: number, screenY: number) => void) | null = null;

  constructor(canvas: HTMLCanvasElement) {
    this._canvas = canvas;
    this._bind();
  }

  /** Convert clientX/Y to canvas-relative coords, accounting for DPR */
  private _toCanvas(clientX: number, clientY: number): [number, number] {
    const rect = this._canvas.getBoundingClientRect();
    const dpr = this._canvas.width / rect.width || 1;
    return [
      (clientX - rect.left) * dpr,
      (clientY - rect.top) * dpr,
    ];
  }

  private _bind(): void {
    const on = (type: string, fn: (e: any) => void, options?: AddEventListenerOptions) => {
      const listener = fn as EventListener;
      this._canvas.addEventListener(type, listener, options);
      this._listeners.push([type, listener, options]);
    };

    on('pointerdown', (e: PointerEvent) => {
      if (e.button !== 0) return;
      this._isDown = true;
      this._isDragging = false;
      this._startX = e.clientX;
      this._startY = e.clientY;
      this._lastX = e.clientX;
      this._lastY = e.clientY;
    });

    on('pointermove', (e: PointerEvent) => {
      if (this._isDown) {
        const dx = e.clientX - this._lastX;
        const dy = e.clientY - this._lastY;
        const totalDx = e.clientX - this._startX;
        const totalDy = e.clientY - this._startY;

        if (!this._isDragging) {
          if (Math.abs(totalDx) >= DRAG_THRESHOLD || Math.abs(totalDy) >= DRAG_THRESHOLD) {
            this._isDragging = true;
          }
        }

        if (this._isDragging && this.onPan) {
          // Pan uses raw pixel deltas (not canvas-scaled)
          const dpr = this._canvas.width / this._canvas.getBoundingClientRect().width || 1;
          this.onPan(dx * dpr, dy * dpr);
        }

        this._lastX = e.clientX;
        this._lastY = e.clientY;
      } else {
        // Not dragging — hover
        if (this.onHover) {
          const [cx, cy] = this._toCanvas(e.clientX, e.clientY);
          this.onHover(cx, cy);
        }
      }
    });

    on('pointerup', (_e: PointerEvent) => {
      this._isDown = false;
    });

    on('click', (e: MouseEvent) => {
      if (!this._isDragging && this.onClick) {
        const [cx, cy] = this._toCanvas(e.clientX, e.clientY);
        this.onClick(cx, cy);
      }
    });

    on('dblclick', (e: MouseEvent) => {
      if (this.onDoubleClick) {
        const [cx, cy] = this._toCanvas(e.clientX, e.clientY);
        this.onDoubleClick(cx, cy);
      }
    });

    on('wheel', (e: WheelEvent) => {
      e.preventDefault();
      if (this.onZoom) {
        const [cx, cy] = this._toCanvas(e.clientX, e.clientY);
        // Scroll up (negative deltaY) = zoom in = positive delta
        const delta = -e.deltaY > 0 ? 1 : -1;
        this.onZoom(delta, cx, cy);
      }
    }, { passive: false });
  }

  dispose(): void {
    for (const [type, listener, options] of this._listeners) {
      this._canvas.removeEventListener(type, listener, options);
    }
    this._listeners.length = 0;
  }
}
