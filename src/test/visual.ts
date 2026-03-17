/**
 * Visual regression test utilities.
 *
 * Renders to a node-canvas, captures PNG, compares pixel-by-pixel against
 * stored reference snapshots. On first run, creates the reference.
 * On mismatch, writes a diff image highlighting changed pixels.
 *
 * Usage in tests:
 *   const result = await matchesSnapshot('buildings-basic', canvas);
 *   expect(result.pass).toBe(true);
 *
 * To update snapshots:
 *   npm run test:update   (or vitest run --update)
 */
import { existsSync, mkdirSync, readFileSync, writeFileSync, unlinkSync } from 'fs';
import { join, dirname } from 'path';
import { Canvas } from 'canvas';
import pixelmatch from 'pixelmatch';
import { PNG } from 'pngjs';

const SNAPSHOT_DIR = join(dirname(new URL(import.meta.url).pathname), 'snapshots');
const DIFF_DIR = join(dirname(new URL(import.meta.url).pathname), 'diffs');

export interface SnapshotResult {
  pass: boolean;
  message: string;
  diffPixels?: number;
  totalPixels?: number;
  diffPercent?: number;
  snapshotPath?: string;
  diffPath?: string;
  actualPath?: string;
  created?: boolean;
}

/**
 * Compare a rendered canvas against a stored reference PNG.
 *
 * @param name    Unique snapshot name (becomes the filename)
 * @param canvas  The node-canvas instance that was rendered to
 * @param threshold  Pixel diff threshold 0..1 (0 = exact, 0.1 = lenient)
 *                   Default 0 for pixel-perfect verification
 */
export function matchesSnapshot(
  name: string,
  canvas: Canvas,
  threshold: number = 0,
): SnapshotResult {
  mkdirSync(SNAPSHOT_DIR, { recursive: true });
  mkdirSync(DIFF_DIR, { recursive: true });

  const snapshotPath = join(SNAPSHOT_DIR, `${name}.png`);
  const diffPath = join(DIFF_DIR, `${name}-diff.png`);
  const actualPath = join(DIFF_DIR, `${name}-actual.png`);

  // Get actual image data from canvas
  const actualBuffer = canvas.toBuffer('image/png');

  // Check if updating snapshots
  const isUpdate = process.env.VITEST_UPDATE === 'true' ||
    process.argv.includes('--update') ||
    process.argv.includes('-u');

  if (!existsSync(snapshotPath) || isUpdate) {
    writeFileSync(snapshotPath, actualBuffer);
    // Clean up any old diff
    if (existsSync(diffPath)) unlinkSync(diffPath);
    if (existsSync(actualPath)) unlinkSync(actualPath);
    return {
      pass: true,
      message: isUpdate
        ? `Snapshot updated: ${name}`
        : `Snapshot created: ${name}. Run tests again to verify.`,
      snapshotPath,
      created: true,
    };
  }

  // Load reference snapshot
  const expectedBuffer = readFileSync(snapshotPath);
  const expected = PNG.sync.read(expectedBuffer);
  const actual = PNG.sync.read(actualBuffer);

  // Dimension mismatch
  if (expected.width !== actual.width || expected.height !== actual.height) {
    writeFileSync(actualPath, actualBuffer);
    return {
      pass: false,
      message: `Snapshot dimension mismatch for "${name}": ` +
        `expected ${expected.width}x${expected.height}, ` +
        `got ${actual.width}x${actual.height}. ` +
        `Actual saved to ${actualPath}`,
      snapshotPath,
      actualPath,
    };
  }

  // Pixel comparison
  const width = expected.width;
  const height = expected.height;
  const diffImage = new PNG({ width, height });

  const diffPixels = pixelmatch(
    expected.data,
    actual.data,
    diffImage.data,
    width,
    height,
    { threshold },
  );

  const totalPixels = width * height;
  const diffPercent = (diffPixels / totalPixels) * 100;

  if (diffPixels === 0) {
    // Clean up old diffs on pass
    if (existsSync(diffPath)) unlinkSync(diffPath);
    if (existsSync(actualPath)) unlinkSync(actualPath);
    return {
      pass: true,
      message: `Snapshot matches: ${name}`,
      diffPixels: 0,
      totalPixels,
      diffPercent: 0,
      snapshotPath,
    };
  }

  // Write diff and actual for debugging
  writeFileSync(diffPath, PNG.sync.write(diffImage));
  writeFileSync(actualPath, actualBuffer);

  return {
    pass: false,
    message: `Snapshot mismatch for "${name}": ${diffPixels} pixels differ ` +
      `(${diffPercent.toFixed(2)}%). Diff: ${diffPath}`,
    diffPixels,
    totalPixels,
    diffPercent,
    snapshotPath,
    diffPath,
    actualPath,
  };
}

/**
 * Custom vitest matcher: expect(canvas).toMatchVisualSnapshot('name')
 */
export function toMatchVisualSnapshot(
  canvas: Canvas,
  name: string,
  threshold?: number,
) {
  const result = matchesSnapshot(name, canvas, threshold);
  return {
    pass: result.pass,
    message: () => result.message,
  };
}
