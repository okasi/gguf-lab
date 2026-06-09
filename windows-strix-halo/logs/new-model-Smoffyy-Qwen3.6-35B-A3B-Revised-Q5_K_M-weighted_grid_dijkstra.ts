import * as fs from 'fs';

class MinHeap {
  private data: [number, number, number][] = [];
  push(item: [number, number, number]) {
    this.data.push(item);
    this._bubbleUp(this.data.length - 1);
  }
  pop(): [number, number, number] | undefined {
    if (this.data.length === 0) return undefined;
    const top = this.data[0];
    const last = this.data.pop()!;
    if (this.data.length > 0) {
      this.data[0] = last;
      this._sinkDown(0);
    }
    return top;
  }
  get size() { return this.data.length; }
  private _bubbleUp(i: number) {
    while (i > 0) {
      const p = (i - 1) >> 1;
      if (this.data[i][0] < this.data[p][0]) {
        [this.data[i], this.data[p]] = [this.data[p], this.data[i]];
        i = p;
      } else break;
    }
  }
  private _sinkDown(i: number) {
    const n = this.data.length;
    while (true) {
      let l = (i << 1) + 1;
      let r = l + 1;
      let smallest = i;
      if (l < n && this.data[l][0] < this.data[smallest][0]) smallest = l;
      if (r < n && this.data[r][0] < this.data[smallest][0]) smallest = r;
      if (smallest !== i) {
        [this.data[i], this.data[smallest]] = [this.data[smallest], this.data[i]];
        i = smallest;
      } else break;
    }
  }
}

function solve() {
  const input = fs.readFileSync(0, 'utf8').trim();
  if (!input) return;

  const lines = input.split(/\r?\n/).filter(l => l.trim().length > 0);
  const [H, W] = lines[0].trim().split(/\s+/).map(Number);
  const grid: string[] = [];
  for (let i = 1; i <= H; i++) {
    grid.push(lines[i].trim());
  }

  let startR = -1, startC = -1;
  let targetR = -1, targetC = -1;

  for (let r = 0; r < H; r++) {
    for (let c = 0; c < W; c++) {
      if (grid[r][c] === 'S') { startR = r; startC = c; }
      if (grid[r][c] === 'T') { targetR = r; targetC = c; }
    }
  }

  const dist: number[][] = Array.from({ length: H }, () => Array(W).fill(Infinity));
  dist[startR][startC] = 0;
  const pq = new MinHeap();
  pq.push([0, startR, startC]);

  const dirs = [[0, 1], [0, -1], [1, 0], [-1, 0]];

  while (pq.size > 0) {
    const [d, r, c] = pq.pop()!;
    if (d > dist[r][c]) continue;
    if (r === targetR && c === targetC) {
      console.log(d);
      return;
    }
    for (const [dr, dc] of dirs) {
      const nr = r + dr;
      const nc = c + dc;
      if (nr >= 0 && nr < H && nc >= 0 && nc < W) {
        const cell = grid[nr][nc];
        if (cell === '#') continue;
        const cost = (cell === 'S' || cell === 'T') ? 0 : Number(cell);
        const newDist = d + cost;
        if (newDist < dist[nr][nc]) {
          dist[nr][nc] = newDist;
          pq.push([newDist, nr, nc]);
        }
      }
    }
  }

  console.log(-1);
}

solve();
