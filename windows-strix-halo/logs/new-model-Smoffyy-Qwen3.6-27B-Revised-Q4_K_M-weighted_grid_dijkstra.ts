import * as fs from 'fs';

class MinHeap {
  private data: [number, number, number][] = [];

  push(val: [number, number, number]) {
    this.data.push(val);
    this.bubbleUp(this.data.length - 1);
  }

  pop(): [number, number, number] {
    const top = this.data[0];
    const bottom = this.data.pop()!;
    if (this.data.length > 0) {
      this.data[0] = bottom;
      this.bubbleDown(0);
    }
    return top;
  }

  size(): number {
    return this.data.length;
  }

  private bubbleUp(idx: number) {
    const val = this.data[idx];
    while (idx > 0) {
      const parentIdx = (idx - 1) >> 1;
      const parent = this.data[parentIdx];
      if (val[0] >= parent[0]) break;
      this.data[parentIdx] = val;
      this.data[idx] = parent;
      idx = parentIdx;
    }
    this.data[idx] = val;
  }

  private bubbleDown(idx: number) {
    const len = this.data.length;
    const val = this.data[idx];
    while (true) {
      let left = 2 * idx + 1;
      let right = 2 * idx + 2;
      let smallest = idx;
      if (left < len && this.data[left][0] < val[0]) smallest = left;
      if (right < len && this.data[right][0] < this.data[smallest][0]) smallest = right;
      if (smallest === idx) break;
      this.data[idx] = this.data[smallest];
      this.data[smallest] = val;
      idx = smallest;
    }
    this.data[idx] = val;
  }
}

function main() {
  const input = fs.readFileSync(0, 'utf8').trim().split('\n');
  const [H, W] = input[0].split(/\s+/).map(Number);
  const grid: string[] = input.slice(1, H + 1).map(line => line.trim());

  let sr = -1, sc = -1, tr = -1, tc = -1;
  for (let i = 0; i < H; i++) {
    for (let j = 0; j < W; j++) {
      if (grid[i][j] === 'S') { sr = i; sc = j; }
      else if (grid[i][j] === 'T') { tr = i; tc = j; }
    }
  }

  const dist: number[][] = Array.from({ length: H }, () => new Array(W).fill(Infinity));
  dist[sr][sc] = 0;
  const heap = new MinHeap();
  heap.push([0, sr, sc]);
  const dirs = [[0, 1], [0, -1], [1, 0], [-1, 0]];
  let result = -1;

  while (heap.size() > 0) {
    const [d, r, c] = heap.pop();
    if (d > dist[r][c]) continue;
    if (r === tr && c === tc) {
      result = d;
      break;
    }
    for (const [dr, dc] of dirs) {
      const nr = r + dr;
      const nc = c + dc;
      if (nr < 0 || nr >= H || nc < 0 || nc >= W) continue;
      const cell = grid[nr][nc];
      if (cell === '#') continue;
      const cost = (cell === 'S' || cell === 'T') ? 0 : parseInt(cell, 10);
      if (d + cost < dist[nr][nc]) {
        dist[nr][nc] = d + cost;
        heap.push([dist[nr][nc], nr, nc]);
      }
    }
  }

  console.log(result);
}

main();
