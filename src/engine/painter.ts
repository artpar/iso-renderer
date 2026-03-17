/**
 * Painter's algorithm — sort drawables back-to-front for correct occlusion.
 */

export interface Drawable {
  id: string;
  worldX: number;
  worldZ: number;
  worldY: number;
}

/**
 * Sort drawables back-to-front. Items with lower (worldX + worldZ) are further away
 * and drawn first. Stable sort preserves insertion order for equal depths.
 */
export function depthSort<T extends Drawable>(items: T[]): T[] {
  return items.slice().sort((a, b) => {
    const da = a.worldX + a.worldZ;
    const db = b.worldX + b.worldZ;
    return da - db;
  });
}
