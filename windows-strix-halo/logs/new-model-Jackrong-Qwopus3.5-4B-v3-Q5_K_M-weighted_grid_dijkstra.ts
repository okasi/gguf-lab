import { readFileSync } from "fs";

function main() {
  const input = readFileSync(0, "utf8");
  const lines = input.trim().split("\n");
  const [hStr, wStr] = lines[0].trim().split(/\s+/);
  const H = parseInt(hStr, 10);
  const W = parseInt(wStr, 10);

  const grid = [];
  for (let i = 0; i < H; i++) {
    if (i < lines.length) {
      grid.push(lines[i + 1]);
    }
  }

  const dirs = [
    { dr: -1, dc: 0 },
    { dr: 1, dc: 0 },
    { dr: 0, dc: -1 },
    { dr: 0, dc: 1 },
  ];

  let startR = -1, startC = -1;
  for (let r = 0; r < H; r++) {
    for (let c = 0; c < W; c++) {
      if (grid[r][c] === "S") {
        startR = r;
        startC = c;
        break;
      }
    }
    if (startR !== -1) break;
  }

  if (startR === -1) {
    console.log("-1");
    return;
  }

  class MinHeap<T> {
    items: Array<{ cost: number; r: number; c: number }>;

    constructor() {
      this.items = [];
    }

    push(item: T) {
      this.items.push(item);
      this.bubbleUp();
    }

    pop(): T | undefined {
      if (this.items.length === 0) return undefined;
      const min = this.items[0];
      const last = this.items.pop();
      if (this.items.length > 0) {
        this.items[0] = last;
        this.bubbleDown();
      }
      return min;
    }

    size(): number {
      return this.items.length;
    }

    private bubbleUp() {
      let i = this.items.length - 1;
      while (i > 0) {
        const j = Math.floor((i - 1) / 2);
        if (this.items[i].cost <= this.items[j].cost) break;
        [this.items[i], this.items[j]] = [this.items[j], this.items[i]];
        i = j;
      }
    }

    private bubbleDown() {
      let i = 0;
      while (true) {
        const left = 2 * i + 1;
        const right = 2 * i + 2;
        const smallest = i;

        if (left < this.items.length && this.items[left].cost < this.items[smallest].cost) {
          smallest = left;
        }
        if (right < this.items.length && this.items[right].cost < this.items[smallest].cost) {
          smallest = right;
        }

        if (smallest !== i) {
          [this.items[i], this.items[smallest]] = [this.items[smallest], this.items[i]];
          i = smallest;
        } else {
          break;
        }
      }
    }
  }

  const dist = Array(H).fill(null).map(() => Array(W).fill(Infinity));
  const heap = new MinHeap<{ cost: number; r: number; c: number }>();
  const type = {} as any;

  heap.push({ cost: 0, r: startR, c: startC });
  dist[startR][startC] = 0;

  while (heap.size() > 0) {
    const { cost, r, c } = heap.pop() as any;

    if (cost > dist[r][c]) continue;

    if (grid[r][c] === "T") {
      console.log(cost);
      return;
    }

    for (const dir of dirs) {
      const nr = r + dir.dr;
      const nc = c + dir.dc;

      if (nr < 0 || nr >= H || nc < 0 || nc >= W) continue;
      const char = grid[nr][nc];

      if (char === "#") continue;

      let weight = 0;
      if (char === "S" || char === "T") {
        weight = 0;
      } else {
        weight = parseInt(char, 10);
      }

      const newCost = cost + weight;
      if (newCost < dist[nr][nc]) {
        dist[nr][nc] = newCost;
        heap.push({ cost: newCost, r: nr, c: nc });
      }
    }
  }

  console.log("-1");
}

main();
