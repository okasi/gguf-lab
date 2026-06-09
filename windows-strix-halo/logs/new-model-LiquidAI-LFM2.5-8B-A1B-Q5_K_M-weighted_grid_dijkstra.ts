import { readFileSync } from 'fs';

interface Node {
  cost: number;
  row: number;
  col: number;
}

function dijkstra(grid: string[], h: number, w: number, start: [number, number], target: [number, number]) {
  const INF = Number.MAX_SAFE_INTEGER;
  const dist = Array.from({ length: h }, () => Array<number>(new Array(w).fill(INF)));
  const pq = new PriorityQueue();

  const [sr, sc] = start;
  const [tr, tc] = target;

  dist[sr][sc] = 0;
  pq.push([0, sr, sc]);

  const dirs = [
    [[1, 0], [-1, 0], [0, 1], [0, -1]]
  ];

  while (pq.heap.length) {
    const [d, r, c] = pq.pop();
    if (d !== dist[r][c]) continue;
    if ([r, c] === target) break;
    for (const [dr, dc] of dirs[0]) {
      const nr = r + dr;
      const nc = c + dc;
      if (nr < 0 || nr >= h || nc < 0 || nc >= w) continue;
      const cell = grid[nr][nc];
      if (cell === '#') continue;
      const add = parseInt(cell, 10);
      const nd = d + add;
      if (nd < dist[nr][nc]) {
        dist[nr][nc] = nd;
        pq.push([nd, nr, nc]);
      }
    }
  }

  return dist[tr][tc] === INF ? -1 : dist[tr][tc];
}

class PriorityQueue {
  private heap: [number, number, number[]][];

  constructor() { this.heap = []; }

  push(item: [number, number, number]) {
    this.heap.push(item);
    this.heap.sort((a, b) => a[0] - b[0]);
  }

  pop(): [number, number, number] | undefined {
    return this.heap.shift();
  }
}

function main() {
  const data = readFileSync(0, "utf8");
  const lines = data.trim().split('\n');
  if (lines.length === 0) return;
  const first = lines[0].trim().split(/\s+/);
  const H = parseInt(first[0], 10);
  const W = parseInt(first[1], 10);
  let grid: string[] = [];
  for (let i = 1; i < lines.length; ++i) {
    if (lines[i].length !== W) grid.push(lines[i].trim());
    else grid.push(lines[i]);
  }
  let start: [number, number] = [-1, -1];
  let target: [number, number] = [-1, -1];
  for (let r = 0; r < H; ++r) {
    for (let c = 0; c < W; ++c) {
      const ch = grid[r][c];
      if (ch === 'S') start = [r, c];
      if (ch === 'T') target = [r, c];
    }
  }
  const ans = dijkstra(grid, H, W, start, target);
  console.log(ans.toString());
}

if (require.main === module) {
  main();
}
