import * as fs from "fs";

type State = {
  r: number;
  c: number;
  cost: number;
};

class MinHeap {
  private data: State[] = [];

  get size(): number {
    return this.data.length;
  }

  peek(): State | undefined {
    return this.data[0];
  }

  push(item: State): void {
    this.data.push(item);
    this.siftUp(this.data.length - 1);
  }

  pop(): State | undefined {
    if (this.data.length === 0) return undefined;
    if (this.data.length === 1) return this.data.pop();

    const result = this.data[0];
    this.data[0] = this.data.pop()!;
    this.siftDown(0);
    return result;
  }

  private compare(a: State, b: State): number {
    if (a.cost !== b.cost) return a.cost - b.cost;
    if (a.r !== b.r) return a.r - b.r;
    return a.c - b.c;
  }

  private siftUp(index: number): void {
    while (index > 0) {
      const parent = Math.floor((index - 1) / 2);
      if (this.compare(this.data[parent], this.data[index]) <= 0) break;
      this.swap(parent, index);
      index = parent;
    }
  }

  private siftDown(index: number): void {
    while (true) {
      const left = index * 2 + 1;
      const right = left + 1;
      let smallest = index;

      if (left < this.data.length && this.compare(this.data[left], this.data[smallest]) < 0) {
        smallest = left;
      }

      if (right < this.data.length && this.compare(this.data[right], this.data[smallest]) < 0) {
        smallest = right;
      }

      if (smallest === index) break;
      this.swap(index, smallest);
      index = smallest;
    }
  }

  private swap(a: number, b: number): void {
    const temp = this.data[a];
    this.data[a] = this.data[b];
    this.data[b] = temp;
  }
}

function main(): void {
  const input = fs.readFileSync(0, "utf8");
  const lines = input.split(/\r?\n/);
  const [hLine, ...gridLines] = lines;
  const [hText, wText] = hLine.trim().split(/\s+/);

  const H = Number(hText);
  const W = Number(wText);
  const grid = gridLines.slice(0, H);

  let sr = -1;
  let sc = -1;
  let tr = -1;
  let tc = -1;

  for (let r = 0; r < H; r++) {
    for (let c = 0; c < W; c++) {
      const cell = grid[r][c];
      if (cell === "S") {
        sr = r;
        sc = c;
      } else if (cell === "T") {
        tr = r;
        tc = c;
      }
    }
  }

  if (sr === -1 || tr === -1) {
    console.log(-1);
    return;
  }

  const dist = Array.from({ length: H }, () => Array<number>(W).fill(Infinity));
  const heap = new MinHeap();

  dist[sr][sc] = 0;
  heap.push({ r: sr, c: sc, cost: 0 });

  const directions = [
    [-1, 0],
    [1, 0],
    [0, -1],
    [0, 1],
  ];

  while (heap.size > 0) {
    const current = heap.pop()!;
    const { r, c, cost } = current;

    if (cost !== dist[r][c]) continue;

    if (r === tr && c === tc) {
      console.log(cost);
      return;
    }

    for (const [dr, dc] of directions) {
      const nr = r + dr;
      const nc = c + dc;

      if (nr < 0 || nr >= H || nc < 0 || nc >= W) continue;

      const cell = grid[nr][nc];
      if (cell === "#") continue;

      const nextCost = cell >= "0" && cell <= "9" ? Number(cell) : 0;
      const total = cost + nextCost;

      if (total < dist[nr][nc]) {
        dist[nr][nc] = total;
        heap.push({ r: nr, c: nc, cost: total });
      }
    }
  }

  console.log(dist[tr][tc] === Infinity ? -1 : dist[tr][tc]);
}

main();
