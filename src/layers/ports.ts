import { ZOOM, withAlpha } from '../constants';
import { worldToScreen } from '../engine/projection';
import type { IsoMap, MapCity, MapPort, Viewport, RenderState } from '../types';

/** Render port markers on city faces — input ports on -Z face, output ports on +Z face */
export function renderPorts(
  ctx: CanvasRenderingContext2D,
  map: IsoMap,
  vp: Viewport,
  _state: RenderState,
): void {
  if (vp.zoom < ZOOM.portThreshold) return;

  for (const city of map.cities) {
    // Input ports on the -Z face (back edge)
    for (const port of city.inputPorts) {
      drawPort(ctx, city, port, 'input', vp);
    }
    // Output ports on the +Z face (front edge)
    for (const port of city.outputPorts) {
      drawPort(ctx, city, port, 'output', vp);
    }
  }
}

function drawPort(
  ctx: CanvasRenderingContext2D,
  city: MapCity,
  port: MapPort,
  direction: 'input' | 'output',
  vp: Viewport,
): void {
  const portZ = direction === 'input' ? city.z : city.z + city.depth;
  const portX = city.x + port.x;
  const portY = 0.1; // Slightly above ground

  const center = worldToScreen(portX + port.width / 2, portY, portZ, vp);
  const size = Math.max(3, port.width * vp.zoom * 0.3);

  // Port diamond marker
  ctx.beginPath();
  ctx.moveTo(center.x, center.y - size);
  ctx.lineTo(center.x + size * 0.7, center.y);
  ctx.lineTo(center.x, center.y + size);
  ctx.lineTo(center.x - size * 0.7, center.y);
  ctx.closePath();
  ctx.fillStyle = withAlpha(port.color, 0.8);
  ctx.fill();
  ctx.strokeStyle = port.color;
  ctx.lineWidth = 1;
  ctx.stroke();

  // Direction indicator (arrow in/out)
  const arrowSize = size * 0.4;
  const arrowY = direction === 'input' ? center.y + size + arrowSize : center.y - size - arrowSize;

  ctx.beginPath();
  if (direction === 'input') {
    // Arrow pointing down (into the city)
    ctx.moveTo(center.x, center.y + size + 2);
    ctx.lineTo(center.x - arrowSize, arrowY);
    ctx.lineTo(center.x + arrowSize, arrowY);
  } else {
    // Arrow pointing up (out of the city)
    ctx.moveTo(center.x, center.y - size - 2);
    ctx.lineTo(center.x - arrowSize, arrowY);
    ctx.lineTo(center.x + arrowSize, arrowY);
  }
  ctx.closePath();
  ctx.fillStyle = withAlpha(port.color, 0.6);
  ctx.fill();
}
