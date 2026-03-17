/**
 * Rendering constants — domain-agnostic.
 * No knowledge of code analysis, types, or consumer semantics.
 */

/** City platform palette */
export const CITY = {
  ground:      '#2a2a2a',
  groundFocus: '#333333',
  border:      '#555555',
  borderFocus: '#e0a050',
  gridLine:    '#3a3a3a',
  text:        '#f0f0f0',
  textDim:     '#b0b0b0',
  bg:          '#1a1a1a',
} as const;

/** Selection / hover / issue overlay colors */
export const OVERLAY = {
  selected:    '#ffffff',
  hovered:     '#f0e070',
  highlighted: '#60c0ff',
  dimAlpha:    0.25,
} as const;

/** Pipeline rendering */
export const PIPELINE_ALPHA = 0.7;

/** Particle animation */
export const PARTICLE = {
  speed: 40,       // pixels per second
  size: 3,         // radius
  spacing: 20,     // pixels between particles
  alpha: 0.8,
} as const;

/** Isometric projection constants */
export const ISO = {
  cos30: Math.cos(Math.PI / 6),  // ≈ 0.866
  sin30: Math.sin(Math.PI / 6),  // 0.5
} as const;

/** Building face brightness modifiers */
export const FACE = {
  topBrighten:  0.2,
  leftDarken:   0.15,
  rightDarken:  0.3,
} as const;

/** Minimum building dimension in screen pixels before hiding labels */
export const MIN_LABEL_SIZE = 20;

/** Zoom level thresholds */
export const ZOOM = {
  min: 0.1,
  max: 10,
  default: 1,
  labelThreshold: 0.5,
  detailThreshold: 1.5,
  portThreshold: 0.8,
} as const;

// ─── Color utilities ───────────────────────────────────────────────

/** Parse hex color to RGB components */
export function hexToRgb(hex: string): [number, number, number] {
  const n = parseInt(hex.slice(1), 16);
  return [(n >> 16) & 0xff, (n >> 8) & 0xff, n & 0xff];
}

/** RGB to hex string */
export function rgbToHex(r: number, g: number, b: number): string {
  return '#' + ((1 << 24) | (r << 16) | (g << 8) | b).toString(16).slice(1);
}

/** Brighten a hex color by amount (0..1) */
export function brighten(hex: string, amount: number): string {
  const [r, g, b] = hexToRgb(hex);
  return rgbToHex(
    Math.min(255, Math.round(r + (255 - r) * amount)),
    Math.min(255, Math.round(g + (255 - g) * amount)),
    Math.min(255, Math.round(b + (255 - b) * amount)),
  );
}

/** Darken a hex color by amount (0..1) */
export function darken(hex: string, amount: number): string {
  const [r, g, b] = hexToRgb(hex);
  return rgbToHex(
    Math.round(r * (1 - amount)),
    Math.round(g * (1 - amount)),
    Math.round(b * (1 - amount)),
  );
}

/** Hex color with alpha → rgba() string */
export function withAlpha(hex: string, alpha: number): string {
  const [r, g, b] = hexToRgb(hex);
  return `rgba(${r},${g},${b},${alpha})`;
}
