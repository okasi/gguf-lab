import * as fs from 'fs';

class MinHeap {
  private data: [number, number, number][];

  constructor() {
    this.data = [];
  }

  size(): number {
    return this.data.length;
  }

  empty(): boolean {
    return this.data.length === 0;
  }

  push(item: [number, number, number]): void {
    this.data.push(item);
    this.bubbleUp(this.data.length - 1);
  }

  pop(): [number, number, number] | undefined {
    if (this.data.length === 0) return undefined;
    const top = this.data[0];
    const last = this.data.pop();
    if (this.data.length > 0) {
      this.data[0] = last!;
      this.sinkDown(0);
    }
    return top;
  }

  private bubbleUp(idx: number): void {
    const item = this.data[idx];
    while (idx > 0) {
      const parentIdx = Math.floor((idx - 1) / 2);
      const parent = this.data[parentIdx];
      if (parent[0] <= item[0]) break;
      this.data[idx] = parent;
      idx = parentIdx;
    }
    this.data[idx] = item;
  }

  private sinkDown(idx: number): void {
    const item = this.data[idx];
    const length = this.data.length;
    while (true) {
      const left = 2 * idx + 1;
      const right = left + 1;
      let smallest = idx;
      if (left < length && this.data[left][0] < this.data[smallest][0]) smallest = left;
      if (right < length && this.data[right][0] < this.data[smallest][0]) smallest = right;
      if (smallest === idx) break;
      this.data[idx] = this.data[smallest];
      idx = smallest;
    }
    this.data[idx] = item;
  }
}

function main(): void {
  const input = fs.readFileSync(0, "utf8").trim();
  const lines = input.split(/\r?\n/);
  const [H, W] = lines[0].split(/\s+/).map(Number);

  const grid: string[][] = [];
  let startR = -1, startC = -1;
  let targetR = -1, targetC = -1;

  for (let i = 1; i <= H; i++) {
    const row = lines[i];
    grid.push(row.split(''));
    for (let j = 0; j < W; j++) {
      if (row[j] === 'S') {
        startR = i - 1;
        startC = j;
      } else if (row[j] === 'T') {
        targetR = i - 1;
        targetC = j;
      }
    }
  }

  const INF = Number.MAX_SAFE_INTEGER;
  const dist: number[][] = Array.from({ length: H }, () => new Float64Array(W).fill(INF));
  dist[startR][startC] = 0;

  const heap = new MinHeap();
  heap.push([0, startR, startC]);

  const dr = [-1, 1, 0, 0];
  const dc = [0, 0, -1, 1];

  while (!heap.empty()) {
    const [d, r, c] = heap.pop()!;
    if (d > dist[r][c]) continue;

    for (let i = 0; i < 4; i++) {
      const nr = r + dr[i];
      const nc = c + dc[i];
      if (nr < 0 || nr >= H || nc < 0 || nc >= W) continue;
      const cell = grid[nr][nc];
      if (cell === '#') continue;

      let costToAdd = 0;
      if (cell >= '0' && cell <= '9') {
        costToAdd = parseInt(cell, 10);
      }
      // S and T have cost 0, but they are not digits; also they are not '#'.
      // However, if we encounter S or T again, costToAdd remains 0, which is correct.

      const newDist = d + costToAdd;
      if (newDist < dist[nr][nc]) {
        dist[nr][nc] = newDist;
        heap.push([newDist, nr, nc]);
      }
    }
  }

  const answer = dist[targetR][targetC];
  console.log(answer === INF ? -1 : answer);
}

main();
