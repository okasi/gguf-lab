import * as fs from 'fs';

class MinHeap {
  private data: [number, number, number][];

  constructor() {
    this.data = [];
  }

  push(item: [number, number, number]): void {
    this.data.push(item);
    this.siftUp(this.data.length - 1);
  }

  pop(): [number, number, number] | undefined {
    if (this.data.length === 0) return undefined;
    const top = this.data[0];
    const last = this.data.pop();
    if (this.data.length > 0) {
      this.data[0] = last;
      this.siftDown(0);
    }
    return top;
  }

  isEmpty(): boolean {
    return this.data.length === 0;
  }

  private siftUp(i: number): void {
    while (i > 0) {
      const parent = (i - 1) >> 1;
      if (this.data[i][0] < this.data[parent][0]) {
        [this.data[i], this.data[parent]] = [this.data[parent], this.data[i]];
        i = parent;
      } else {
        break;
      }
    }
  }

  private siftDown(i: number): void {
    const n = this.data.length;
    while (true) {
      let smallest = i;
      const left = 2 * i + 1;
      const right = 2 * i + 2;
      if (left < n && this.data[left][0] < this.data[smallest][0]) smallest = left;
      if (right < n && this.data[right][0] < this.data[smallest][0]) smallest = right;
      if (smallest !== i) {
        [this.data[i], this.data[smallest]] = [this.data[smallest], this.data[i]];
        i = smallest;
      } else {
        break;
      }
    }
  }
}

function main(): void {
  const input = fs.readFileSync(0, 'utf8').trim();
  const lines = input.split(/\r?\n/).filter(line => line !== '');
  const [H, W] = lines[0].split(/\s+/).map(Number);
  const grid: string[][] = [];
  let sx = -1, sy = -1, tx = -1, ty = -1;

  for (let i = 0; i < H; i++) {
    const line = lines[i + 1];
    const row = line.substring(0, W);
    grid.push(row);
    for (let j = 0; j < W; j++) {
      const ch = row[j];
      if (ch === 'S') {
        sx = i;
        sy = j;
      } else if (ch === 'T') {
        tx = i;
        ty = j;
      }
    }
  }

  const dist: number[][] = Array.from({ length: H }, () => Array(W).fill(Infinity));
  dist[sx][sy] = 0;
  const heap = new MinHeap();
  heap.push([0, sx, sy]);

  const dirs = [[-1, 0], [1, 0], [0, -1], [0, 1]];

  while (!heap.isEmpty()) {
    const [d, x, y] = heap.pop();
    if (d > dist[x][y]) continue;
    for (const [dx, dy] of dirs) {
      const nx = x + dx;
      const ny = y + dy;
      if (nx < 0 || nx >= H || ny < 0 || ny >= W) continue;
      const ch = grid[nx][ny];
      if (ch === '#') continue;
      const cost = (ch === 'S' || ch === 'T') ? 0 : parseInt(ch, 10);
      const nd = d + cost;
      if (nd < dist[nx][ny]) {
        dist[nx][ny] = nd;
        heap.push([nd, nx, ny]);
      }
    }
  }

  const result = dist[tx][ty] === Infinity ? -1 : dist[tx][ty];
  console.log(result);
}

main();
