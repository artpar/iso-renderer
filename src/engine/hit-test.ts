/**
 * Screen-space spatial index for mouse → building lookup.
 * Uses a grid of cells. Each cell stores building polygons that overlap it.
 * On query, checks the cell at (screenX, screenY) and point-in-polygon tests candidates.
 */

interface Point { x: number; y: number }

interface Entry {
  id: string;
  polygon: Point[];
  drawOrder: number;
}

const CELL_SIZE = 32;

export class HitTester {
  private _width: number;
  private _height: number;
  private _cols: number;
  private _rows: number;
  private _grid: Entry[][];

  constructor(width: number, height: number) {
    this._width = width;
    this._height = height;
    this._cols = Math.ceil(width / CELL_SIZE);
    this._rows = Math.ceil(height / CELL_SIZE);
    this._grid = new Array(this._cols * this._rows).fill(null).map(() => []);
  }

  /** Insert a building's screen-space polygon for hit testing */
  insert(id: string, polygon: Point[], drawOrder: number): void {
    const entry: Entry = { id, polygon, drawOrder };

    // Find bounding box of polygon
    let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
    for (const p of polygon) {
      if (p.x < minX) minX = p.x;
      if (p.y < minY) minY = p.y;
      if (p.x > maxX) maxX = p.x;
      if (p.y > maxY) maxY = p.y;
    }

    // Insert into all overlapping cells
    const startCol = Math.max(0, Math.floor(minX / CELL_SIZE));
    const endCol = Math.min(this._cols - 1, Math.floor(maxX / CELL_SIZE));
    const startRow = Math.max(0, Math.floor(minY / CELL_SIZE));
    const endRow = Math.min(this._rows - 1, Math.floor(maxY / CELL_SIZE));

    for (let row = startRow; row <= endRow; row++) {
      for (let col = startCol; col <= endCol; col++) {
        this._grid[row * this._cols + col].push(entry);
      }
    }
  }

  /** Find the topmost building at screen coordinates */
  hitTest(screenX: number, screenY: number): string | null {
    const col = Math.floor(screenX / CELL_SIZE);
    const row = Math.floor(screenY / CELL_SIZE);

    if (col < 0 || col >= this._cols || row < 0 || row >= this._rows) {
      return null;
    }

    const cell = this._grid[row * this._cols + col];
    let bestId: string | null = null;
    let bestOrder = -1;

    for (const entry of cell) {
      if (entry.drawOrder > bestOrder && pointInPolygon(screenX, screenY, entry.polygon)) {
        bestId = entry.id;
        bestOrder = entry.drawOrder;
      }
    }

    return bestId;
  }

  clear(): void {
    for (const cell of this._grid) {
      cell.length = 0;
    }
  }

  resize(width: number, height: number): void {
    this._width = width;
    this._height = height;
    this._cols = Math.ceil(width / CELL_SIZE);
    this._rows = Math.ceil(height / CELL_SIZE);
    this._grid = new Array(this._cols * this._rows).fill(null).map(() => []);
  }
}

/** Ray-casting point-in-polygon test */
function pointInPolygon(px: number, py: number, polygon: Point[]): boolean {
  let inside = false;
  const n = polygon.length;
  for (let i = 0, j = n - 1; i < n; j = i++) {
    const xi = polygon[i].x, yi = polygon[i].y;
    const xj = polygon[j].x, yj = polygon[j].y;
    if ((yi > py) !== (yj > py) && px < (xj - xi) * (py - yi) / (yj - yi) + xi) {
      inside = !inside;
    }
  }
  return inside;
}
