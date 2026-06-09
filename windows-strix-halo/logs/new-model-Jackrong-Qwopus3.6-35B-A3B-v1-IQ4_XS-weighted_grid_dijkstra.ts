import * as fs from "fs";

class MinHeap {
  private data: { cost: number; r: number; c: number }[] = [];

  push(item: { cost: number; r: number; c: number }) {
    this.data.push(item);
    this.bubbleUp(this.data.length - 1);
  }

  pop(): { cost: number; r: number; c: number } | null {
    if (this.data.length === 0) return null;
    const top = this.data[0];
    const last = this.data.pop();
    if (this.data.length > 0) {
      this.data[0] = last;
      this.bubbleDown(0);
    }
    return top;
  }

  get size(): number {
    return this.data.length;
  }

  private bubbleUp(i: number) {
    while (i > 0) {
      const parent = Math.floor((i - 1) / 2);
      if (this.data[parent].cost <= this.data[i].cost) break;
      [this.data[parent], this.data[i]] = [this.data[i], this.data[parent]];
      i = parent;
    }
  }

  private bubbleDown(i: number) {
    const n = this.data.length;
    while (true) {
      let smallest = i;
      const left = 2 * i + 1;
      const right = 2 * i + 2;

      if (left < n && this.data[left].cost < this.data[smallest].cost) smallest = left;
      if (right < n && this.data[right].cost < this.data[smallest].cost) smallest = right;

      if (smallest === i) break;
      [this.data[i], this.data[smallest]] = [this.data[smallest], this.data[i]];
      i = smallest;
    }
  }
}

function solve(): number {
  const input = fs.readFileSync(0, "utf8").trim();
  if (!input) return -1;

  const lines = input.split("\n");
  const [H, W] = lines[0].split(" ").map(Number);
  const grid = lines.slice(1);

  let startR = -1, startC = -1, targetR = -1, targetC = -1;

  for (let r = 0; r < H; r++) {
    for (let c = 0; c < W; c++) {
      const ch = grid[r][c];
      if (ch === "S") {
        startR = r;
        startC = c;
      } else if (ch === "T") {
        targetR = r;
        targetC = c;
      }
    }
  }

  const dist: number[][] = Array.from({ length: H }, () => Array(W).fill(Infinity));
  dist[startR][startC] = 0;

  const heap = new MinHeap();
  heap.push({ cost: 0, r: startR, c: startC });

  const dirs = [[-1, 0], [1, 0], [0, -1], [0, 1]];

  while (heap.size > 0) {
    const item = heap.pop();
    if (!item) continue;
    const { cost, r, c } = item;

    if (cost > dist[r][c]) continue;
    if (r === targetR && c === targetC) return cost;

    for (const [dr, dc] of dirs) {
      const nr = r + dr;
      const nc = c + dc;

      if (nr < 0 || nr >= H || nc < 0 || nc >= W) continue;
      const nch = grid[nr][nc];
      if (nch === "#") continue;

      const nCost = nch === "S" || nch === "T" ? 0 : parseInt(nch, 10);
      const newCost = cost + nCost;

      if (newCost < dist[nr][nc]) {
        dist[nr][nc] = newCost;
        heap.push({ cost: newCost, r: nr, c: nc });
      }
    }
  }

  return -1;
}

console.log(solve());
