import { describe, it, expect, vi } from 'vitest';
import { InputHandler } from './input';

/** Minimal mock canvas for event handling */
function mockCanvas() {
  const listeners = new Map<string, Function[]>();
  return {
    addEventListener(type: string, fn: Function) {
      if (!listeners.has(type)) listeners.set(type, []);
      listeners.get(type)!.push(fn);
    },
    removeEventListener(type: string, fn: Function) {
      const fns = listeners.get(type);
      if (fns) {
        const i = fns.indexOf(fn);
        if (i >= 0) fns.splice(i, 1);
      }
    },
    getBoundingClientRect: () => ({ left: 0, top: 0, width: 800, height: 600 }),
    style: {} as CSSStyleDeclaration,
    fire(type: string, props: Record<string, unknown> = {}) {
      const fns = listeners.get(type) || [];
      const event = { preventDefault: vi.fn(), ...props };
      fns.forEach(fn => fn(event));
      return event;
    },
    _listeners: listeners,
  };
}

describe('InputHandler', () => {
  it('attaches event listeners on construction', () => {
    const canvas = mockCanvas();
    const handler = new InputHandler(canvas as unknown as HTMLCanvasElement);
    expect(canvas._listeners.size).toBeGreaterThan(0);
  });

  it('calls onPan when dragging', () => {
    const canvas = mockCanvas();
    const onPan = vi.fn();
    const handler = new InputHandler(canvas as unknown as HTMLCanvasElement);
    handler.onPan = onPan;

    canvas.fire('pointerdown', { clientX: 400, clientY: 300, button: 0 });
    canvas.fire('pointermove', { clientX: 410, clientY: 305 });
    canvas.fire('pointerup', { clientX: 410, clientY: 305 });

    expect(onPan).toHaveBeenCalledWith(10, 5);
  });

  it('calls onZoom on wheel event', () => {
    const canvas = mockCanvas();
    const onZoom = vi.fn();
    const handler = new InputHandler(canvas as unknown as HTMLCanvasElement);
    handler.onZoom = onZoom;

    canvas.fire('wheel', { deltaY: -100, clientX: 400, clientY: 300 });
    expect(onZoom).toHaveBeenCalled();
    // Scroll up → zoom in → positive delta
    const [delta, x, y] = onZoom.mock.calls[0];
    expect(delta).toBeGreaterThan(0);
    expect(x).toBe(400);
    expect(y).toBe(300);
  });

  it('calls onHover on pointermove without button down', () => {
    const canvas = mockCanvas();
    const onHover = vi.fn();
    const handler = new InputHandler(canvas as unknown as HTMLCanvasElement);
    handler.onHover = onHover;

    canvas.fire('pointermove', { clientX: 200, clientY: 150, buttons: 0 });
    expect(onHover).toHaveBeenCalledWith(200, 150);
  });

  it('calls onClick on click without drag', () => {
    const canvas = mockCanvas();
    const onClick = vi.fn();
    const handler = new InputHandler(canvas as unknown as HTMLCanvasElement);
    handler.onClick = onClick;

    canvas.fire('pointerdown', { clientX: 400, clientY: 300, button: 0 });
    canvas.fire('pointerup', { clientX: 401, clientY: 300 }); // tiny movement, not a drag
    canvas.fire('click', { clientX: 401, clientY: 300 });

    expect(onClick).toHaveBeenCalled();
  });

  it('calls onDoubleClick on dblclick', () => {
    const canvas = mockCanvas();
    const onDoubleClick = vi.fn();
    const handler = new InputHandler(canvas as unknown as HTMLCanvasElement);
    handler.onDoubleClick = onDoubleClick;

    canvas.fire('dblclick', { clientX: 400, clientY: 300 });
    expect(onDoubleClick).toHaveBeenCalledWith(400, 300);
  });

  it('disposes event listeners', () => {
    const canvas = mockCanvas();
    const handler = new InputHandler(canvas as unknown as HTMLCanvasElement);
    const initialCount = Array.from(canvas._listeners.values()).reduce((s, a) => s + a.length, 0);
    expect(initialCount).toBeGreaterThan(0);

    handler.dispose();
    const afterCount = Array.from(canvas._listeners.values()).reduce((s, a) => s + a.length, 0);
    expect(afterCount).toBe(0);
  });

  it('does not call onPan for tiny mouse movements (< 3px)', () => {
    const canvas = mockCanvas();
    const onPan = vi.fn();
    const handler = new InputHandler(canvas as unknown as HTMLCanvasElement);
    handler.onPan = onPan;

    canvas.fire('pointerdown', { clientX: 400, clientY: 300, button: 0 });
    canvas.fire('pointermove', { clientX: 401, clientY: 301 }); // only 1px
    canvas.fire('pointerup', { clientX: 401, clientY: 301 });

    expect(onPan).not.toHaveBeenCalled();
  });
});
