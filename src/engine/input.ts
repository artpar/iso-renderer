/**
 * Mouse/wheel event handling for canvas interaction.
 * Translates raw DOM events to pan/zoom/hover/click/doubleClick callbacks.
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
  private _listeners: Array<[string, EventListener]> = [];

  onPan: ((dx: number, dy: number) => void) | null = null;
  onZoom: ((delta: number, screenX: number, screenY: number) => void) | null = null;
  onHover: ((screenX: number, screenY: number) => void) | null = null;
  onClick: ((screenX: number, screenY: number) => void) | null = null;
  onDoubleClick: ((screenX: number, screenY: number) => void) | null = null;

  constructor(canvas: HTMLCanvasElement) {
    this._canvas = canvas;
    this._bind();
  }

  private _bind(): void {
    const on = (type: string, fn: (e: any) => void) => {
      const listener = fn as EventListener;
      this._canvas.addEventListener(type, listener);
      this._listeners.push([type, listener]);
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
          this.onPan(dx, dy);
        }

        this._lastX = e.clientX;
        this._lastY = e.clientY;
      } else {
        // Not dragging — hover
        if (this.onHover) {
          this.onHover(e.clientX, e.clientY);
        }
      }
    });

    on('pointerup', (_e: PointerEvent) => {
      this._isDown = false;
    });

    on('click', (e: MouseEvent) => {
      if (!this._isDragging && this.onClick) {
        this.onClick(e.clientX, e.clientY);
      }
    });

    on('dblclick', (e: MouseEvent) => {
      if (this.onDoubleClick) {
        this.onDoubleClick(e.clientX, e.clientY);
      }
    });

    on('wheel', (e: WheelEvent) => {
      e.preventDefault();
      if (this.onZoom) {
        // Scroll up (negative deltaY) = zoom in = positive delta
        const delta = -e.deltaY > 0 ? 1 : -1;
        this.onZoom(delta, e.clientX, e.clientY);
      }
    });
  }

  dispose(): void {
    for (const [type, listener] of this._listeners) {
      this._canvas.removeEventListener(type, listener);
    }
    this._listeners.length = 0;
  }
}
