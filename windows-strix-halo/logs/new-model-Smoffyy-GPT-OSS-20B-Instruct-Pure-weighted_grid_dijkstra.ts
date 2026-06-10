import * as fs from 'fs';

const lines = fs.readFileSync(0, 'utf8').trimEnd().split(/\r?\n/);
const [H, W] = lines[0].trim().split(/\s+/).map(Number);
const grid = lines.slice(1, H + 1);

let startIdx = -1;
let targetIdx = -1;

for (let r = 0; r < H; r++) {
  for (let c = 0; c < W; c++) {
    const ch = grid[r][c];
    const idx = r * W + c;
    if (ch === 'S') startIdx = idx;
    if (ch === 'T') targetIdx = idx;
  }
}

const INF = Number.MAX_SAFE_INTEGER;
const dist = new Array(H * W).fill(INF);
dist[startIdx] = 0;

class MinHeap<T> {
  private heap: T[] = [];
  constructor(private cmp: (a: T, b: T) => boolean) {}
  size() { return this.heap.length; }
  push(item: T) {
    this.heap.push(item);
    this.bubbleUp(this.heap.length - 1);
  }
  pop(): T | undefined {
    if (this.heap.length === 0) return undefined;
    const top = this.heap[0];
    const last = this.heap.pop()!;
    if (this.heap.length > 0) {
      this.heap[0] = last;
      this.bubbleDown(0);
    }
    return top;
  }
  private bubbleUp(idx: number) {
    while (idx > 0) {
      const parent = (idx - 1) >> 1;
      if (this.cmp(this.heap[parent], this.heap[idx])) break;
      [this.heap[parent], this.heap[idx]] = [this.heap[idx], this.heap[parent]];
      idx = parent;
    }
  }
  private bubbleDown(idx: number) {
    const n = this.heap.length;
    while (true) {
      let left = idx * 2 + 1;
      let right = idx * 2 + 2;
      let smallest = idx;
      if (left < n && !this.cmp(this.heap[smallest], this.heap[left])) smallest = left;
      if (right < n && !this.cmp(this.heap[smallest], this.heap[right])) smallest = right;
      if (smallest === idx) break;
      [this.heap[smallest], this.heap[idx]] = [this.heap[idx], this.heap[smallest]];
      idx = smallest;
    }
  }
}

interface Node {
  cost: number;
  idx: number;
}

const heap = new MinHeap<Node>((a, b) => a.cost < b.cost);
heap.push({ cost: 0, idx: startIdx });

const dr = [-1, 1, 0, 0];
const dc = [0, 0, -1, 1];

while (heap.size() > 0) {
  const { cost, idx } = heap.pop()!;
  if (cost > dist[idx]) continue;
  if (idx === targetIdx) break;
  const r = Math.floor(idx / W);
  const c = idx % W;
  for (let dir = 0; dir < 4; dir++) {
    const nr = r + dr[dir];
    const nc = c + dc[dir];
    if (nr < 0 || nr >= H || nc < 0 || nc >= W) continue;
    const ch = grid[nr][nc];
    if (ch === '#') continue;
    const nIdx = nr * W + nc;
    const add = ch === 'S' || ch === 'T' ? 0 : Number(ch);
    const newCost = cost + add;
    if (newCost < dist[nIdx]) {
      dist[nIdx] = newCost;
      heap.push({ cost: newCost, idx: nIdx });
    }
  }
}

const answer = dist[targetIdx] === INF ? -1 : dist[targetIdx];
console.log(answer.toString());
