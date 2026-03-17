import { PARTICLE, withAlpha } from '../constants';
import { worldToScreen } from '../engine/projection';
import type { IsoMap, Viewport, RenderState } from '../types';

export interface ParticleState {
  time: number; // milliseconds since start
}

/** Render animated flow particles along pipeline paths */
export function renderParticles(
  ctx: CanvasRenderingContext2D,
  map: IsoMap,
  vp: Viewport,
  _state: RenderState,
  particles: ParticleState,
): void {
  for (const pipe of map.pipelines) {
    if (pipe.waypoints.length < 2) continue;

    // Compute total path length in screen space
    const screenPts = pipe.waypoints.map(([x, y, z]) => worldToScreen(x, y, z, vp));
    const segments: { from: { x: number; y: number }; to: { x: number; y: number }; len: number }[] = [];
    let totalLen = 0;

    for (let i = 1; i < screenPts.length; i++) {
      const dx = screenPts[i].x - screenPts[i - 1].x;
      const dy = screenPts[i].y - screenPts[i - 1].y;
      const len = Math.sqrt(dx * dx + dy * dy);
      segments.push({ from: screenPts[i - 1], to: screenPts[i], len });
      totalLen += len;
    }

    if (totalLen < 1) continue;

    // Place particles along the path
    const speed = PARTICLE.speed * vp.zoom;
    const spacing = PARTICLE.spacing;
    const numParticles = Math.max(1, Math.floor(totalLen / spacing));

    for (let i = 0; i < numParticles; i++) {
      // Progress along the path (0..totalLen), looping
      const baseOffset = (i / numParticles) * totalLen;
      const timeOffset = (particles.time / 1000) * speed;
      const pos = ((baseOffset + timeOffset) % totalLen + totalLen) % totalLen;

      // Find which segment this position falls on
      let accumulated = 0;
      for (const seg of segments) {
        if (accumulated + seg.len >= pos) {
          const t = (pos - accumulated) / seg.len;
          const px = seg.from.x + (seg.to.x - seg.from.x) * t;
          const py = seg.from.y + (seg.to.y - seg.from.y) * t;

          ctx.beginPath();
          ctx.arc(px, py, PARTICLE.size, 0, Math.PI * 2);
          ctx.fillStyle = withAlpha(pipe.color, PARTICLE.alpha);
          ctx.fill();
          break;
        }
        accumulated += seg.len;
      }
    }
  }
}
